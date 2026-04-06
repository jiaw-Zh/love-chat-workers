/**
 * 恋语 AI — Cloudflare Workers 入口
 * ==================================
 * 处理所有 HTTP 路由，提供 API 和静态页面。
 */

import {
  SCENE_PROMPTS,
  REPLY_STYLES,
  TEST_CASES,
  PRESET_PROVIDERS,
  buildPrompt,
  checkEqWarnings,
  callAI,
} from './prompts.js';

// 导入静态 HTML（在 wrangler 构建时内联）
import HTML_CONTENT from '../static/index.html';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // ===== 路由 =====
      if (path === '/' || path === '/index.html') {
        return new Response(HTML_CONTENT, {
          headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
        });
      }

      if (path === '/api/providers' && request.method === 'GET') {
        const providers = {};
        for (const [key, val] of Object.entries(PRESET_PROVIDERS)) {
          providers[key] = {
            name: val.name,
            default_model: val.default_model,
            base_url: val.base_url,
          };
        }
        return jsonResponse(providers, corsHeaders);
      }

      if (path === '/api/scenes' && request.method === 'GET') {
        const scenes = {};
        for (const [key, val] of Object.entries(SCENE_PROMPTS)) {
          scenes[key] = { name: val.name, description: val.description };
        }
        return jsonResponse(scenes, corsHeaders);
      }

      if (path === '/api/styles' && request.method === 'GET') {
        const styles = {};
        for (const [key, val] of Object.entries(REPLY_STYLES)) {
          styles[key] = { name: val.name, description: val.description };
        }
        return jsonResponse(styles, corsHeaders);
      }

      if (path === '/api/test-cases' && request.method === 'GET') {
        return jsonResponse(TEST_CASES, corsHeaders);
      }

      if (path === '/api/preview-prompt' && request.method === 'POST') {
        const body = await request.json();
        const prompt = buildPrompt({
          scene: body.scene,
          styles: body.styles,
          userPersonality: body.user_personality,
          extraContext: body.extra_context,
        });
        return jsonResponse({ system_prompt: prompt, user_message: body.other_message }, corsHeaders);
      }

      if (path === '/api/check-eq' && request.method === 'POST') {
        const body = await request.json();
        const warnings = checkEqWarnings(body.user_input);
        return jsonResponse({ input: body.user_input, warnings, safe: warnings.length === 0 }, corsHeaders);
      }

      if (path === '/api/generate' && request.method === 'POST') {
        const body = await request.json();

        const prompt = buildPrompt({
          scene: body.scene,
          styles: body.styles,
          userPersonality: body.user_personality,
          extraContext: body.extra_context,
        });

        // 解析提供商
        let baseUrl, modelName, supportsJson, providerName;
        const apiKey = body.api_key || env.AI_API_KEY || '';

        if (body.model_provider === 'custom') {
          if (!body.custom_base_url) {
            return jsonResponse({ error: '自定义提供商需要填写 API 地址 (Base URL)' }, corsHeaders, 400);
          }
          baseUrl = body.custom_base_url.replace(/\/+$/, '');
          modelName = body.custom_model_name || 'default';
          supportsJson = false;
          providerName = '自定义';
        } else if (PRESET_PROVIDERS[body.model_provider]) {
          const provider = PRESET_PROVIDERS[body.model_provider];
          baseUrl = provider.base_url;
          modelName = body.custom_model_name || provider.default_model;
          supportsJson = provider.json_mode;
          providerName = provider.name;
        } else {
          return jsonResponse({ error: `未知的提供商: ${body.model_provider}` }, corsHeaders, 400);
        }

        // 本地模型无需 API Key
        const isLocal = ['ollama', 'lmstudio'].includes(body.model_provider) ||
          (body.model_provider === 'custom' && (body.custom_base_url || '').includes('localhost'));

        if (!apiKey && !isLocal) {
          return jsonResponse({ error: '请提供 API Key（在页面顶部设置）' }, corsHeaders, 400);
        }

        try {
          const result = await callAI(baseUrl, apiKey, modelName, prompt, body.other_message, supportsJson);
          return jsonResponse({
            result,
            system_prompt_used: prompt,
            provider_used: providerName,
            model_used: modelName,
          }, corsHeaders);
        } catch (e) {
          let errorMsg = e.message;
          if (errorMsg.includes('401')) errorMsg = `API Key 无效或已过期 (${providerName})`;
          else if (errorMsg.includes('429')) errorMsg = `请求频率超限 (${providerName})`;
          return jsonResponse({ error: `AI 调用失败: ${errorMsg}` }, corsHeaders, 500);
        }
      }

      // 404
      return new Response('Not Found', { status: 404, headers: corsHeaders });

    } catch (e) {
      return jsonResponse({ error: `服务器错误: ${e.message}` }, corsHeaders, 500);
    }
  },
};

function jsonResponse(data, corsHeaders, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
  });
}
