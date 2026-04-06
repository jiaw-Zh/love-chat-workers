/**
 * 恋语 AI — Prompt 引擎 (JavaScript 版)
 * =====================================
 * 所有 System Prompt、场景模板、情商预警规则的定义中心。
 */

// 导入 Markdown 文件作为 text (由 wrangler rules 配置)
import BASE_PERSONA from '../prompts/base_persona.md';
import SCENE_ICEBREAKER from '../prompts/scene_icebreaker.md';
import SCENE_FLIRTING from '../prompts/scene_flirting.md';
import SCENE_ROMANTIC from '../prompts/scene_romantic.md';
import SCENE_RECONCILE from '../prompts/scene_reconcile.md';
import SCENE_SPECIAL_OCCASION from '../prompts/scene_special_occasion.md';

// ======================================================================
// 场景模式
// ======================================================================

const SCENE_PROMPTS = {
  icebreaker: {
    name: '🌱 破冰模式',
    description: '刚匹配或刚认识，寻找开启话题的"台阶"',
    prompt: SCENE_ICEBREAKER
  },

  flirting: {
    name: '💕 暧昧模式',
    description: '互有好感，高情商推进关系升温',
    prompt: SCENE_FLIRTING
  },

  romantic: {
    name: '❤️ 热恋模式',
    description: '已确认关系，保持新鲜感与亲密度',
    prompt: SCENE_ROMANTIC
  },

  reconcile: {
    name: '🔥 挽回模式',
    description: '吵架/冷战，提供体面且有效的台阶',
    prompt: SCENE_RECONCILE
  },

  special_occasion: {
    name: '🎁 特殊日子',
    description: '生日/纪念日，展现用心与通透',
    prompt: SCENE_SPECIAL_OCCASION
  }
};

// ======================================================================
// 回复风格
// ======================================================================

const REPLY_STYLES = {
  gentle: {
    name: '😊 温柔型',
    description: '温暖体贴、让人感到舒服安心',
    instruction: '用温柔、体贴且有温度的语气回复。像一个懂女生的男朋友，让对方感到被呵护，同时保持自己的框架。'
  },
  humorous: {
    name: '😄 幽默型',
    description: '风趣幽默、适度自嘲、逗对方开心',
    instruction: '用轻松幽默的方式回复。善用自嘲、反转等技巧，让聊天变得轻松有趣，不显油腻。'
  },
  direct: {
    name: '🗣️ 直接型',
    description: '直达核心、不绕弯子、展现态度',
    instruction: '用直接、坦率的方式回复。表达清晰，有话直说，展现一个自信、有担当、不拖泥带水的形象。'
  },
  literary: {
    name: '📝 文艺型',
    description: '有品味、诗意、懂审美',
    instruction: '用稍带文艺感、有品味的语言回复。像是一个懂电影/音乐/生活的有趣灵魂在表达，自然而不做作。'
  },
  caring: {
    name: '🤗 关怀型',
    description: '关注细节、共情力强',
    instruction: '捕捉对方话语中的情绪线索，给出到位的关怀。不是简单的多喝热水，而是能共情其背后的需求。'
  }
};

// ======================================================================
// 情商预警规则
// ======================================================================

const EQ_WARNING_RULES = [
  {
    triggers: ['随便', '都行', '无所谓'],
    warning: '⚠️ 框架缺失：这类回复让你变得没有个性，像是在放弃选择权。',
    suggestion: "试着给出具体的提议或者二选一，比如：'我觉得去XX或去YY都不错，既然你都行，那我们就选XX？'"
  },
  {
    triggers: ['呵呵'],
    warning: "⚠️ 攻击性预警：'呵呵'在当下语境通常带有嘲讽意味。",
    suggestion: "如果真的想表达好笑，直接发'哈哈哈'或相关的表情包"
  },
  {
    triggers: ['哦', '嗯'],
    warning: '⚠️ 话题终结者：单字回复会让对方觉得你不想聊了。',
    suggestion: '在确认之后跟上一个开放式问题或者分享你的感受'
  },
  {
    triggers: ['你怎么又', '你总是', '你每次都'],
    warning: '⚠️ 指责倾向：这类词容易激起对方的防御机制。',
    suggestion: "尝试用情绪表达代替指责，例如：'这事发生时，我其实觉得挺失落的...'"
  },
  {
    triggers: ['多喝热水', '多喝水'],
    warning: '⚠️ 直男经典误区：这叫解决问题的思路，不是解决情绪。',
    suggestion: "先询问具体症状/感受，或者直接订个外卖/送个药品，行动胜过语言"
  },
  {
    triggers: ['别想太多', '你想多了'],
    warning: '⚠️ 否定感受：这会让对方觉得你不理解她的压力或担忧。',
    suggestion: "换成：'我看到这事让你很有压力，聊聊看？'，先认可再开导"
  },
  {
    triggers: ['我错了行了吧'],
    warning: '⚠️ 敷衍式道歉：这是火上浇油，对方能感受到你的不屑。',
    suggestion: '如果不认同，先陈述事实；如果真错了，说出你错在哪了'
  },
  {
    triggers: ['分手吧', '那就分吧'],
    warning: '⚠️ 极端表达：这通常是低价值的表现，用离开来要挟只会折损关系。',
    suggestion: '冷静10分钟，先处理情绪再回消息'
  }
];

// ======================================================================
// 测试用例
// ======================================================================

const TEST_CASES = [
  { name: '破冰 — 对方问周末做什么', scene: 'icebreaker', other_message: '你周末一般干什么呀？' },
  { name: '破冰 — 对方分享生活', scene: 'icebreaker', other_message: '今天加班好累啊，刚到家' },
  { name: '暧昧 — 对方说想你了', scene: 'flirting', other_message: '突然想到你了，你在干嘛～' },
  { name: '暧昧 — 对方发自拍', scene: 'flirting', other_message: '刚换了个发型，好看吗？[图片]' },
  { name: '热恋 — 对方问晚上吃什么', scene: 'romantic', other_message: '宝宝晚上想吃什么呀' },
  { name: '挽回 — 吵架后对方说失望', scene: 'reconcile', other_message: '我真的很失望，我觉得你根本不在乎我的感受' },
  { name: '特殊日期 — 纪念日', scene: 'special_occasion', other_message: '今天是我们在一起100天了诶' },
  { name: '情商测试 — 对方说不舒服', scene: 'romantic', other_message: '我今天肚子好疼，来大姨妈了😢' }
];

// ======================================================================
// 预设大模型提供商
// ======================================================================

const PRESET_PROVIDERS = {
  deepseek:    { name: 'DeepSeek',       base_url: 'https://api.deepseek.com/v1',                         default_model: 'deepseek-chat',            json_mode: true },
  moonshot:    { name: 'Moonshot (Kimi)', base_url: 'https://api.moonshot.cn/v1',                          default_model: 'moonshot-v1-8k',           json_mode: true },
  zhipu:       { name: '智谱 (GLM)',      base_url: 'https://open.bigmodel.cn/api/paas/v4',                default_model: 'glm-4-flash',              json_mode: true },
  qwen:        { name: '通义千问',        base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',    default_model: 'qwen-turbo',               json_mode: true },
  doubao:      { name: '豆包 (Doubao)',   base_url: 'https://ark.cn-beijing.volces.com/api/v3',            default_model: 'doubao-lite-32k',          json_mode: true },
  yi:          { name: '零一万物 (Yi)',   base_url: 'https://api.lingyiwanwu.com/v1',                      default_model: 'yi-lightning',             json_mode: true },
  siliconflow: { name: 'SiliconFlow',     base_url: 'https://api.siliconflow.cn/v1',                       default_model: 'deepseek-ai/DeepSeek-V3',  json_mode: true },
  openai:      { name: 'OpenAI',          base_url: 'https://api.openai.com/v1',                           default_model: 'gpt-4o-mini',              json_mode: true },
  openrouter:  { name: 'OpenRouter',      base_url: 'https://openrouter.ai/api/v1',                        default_model: 'google/gemini-2.0-flash-lite-001', json_mode: true },
  ollama:      { name: 'Ollama',          base_url: 'http://localhost:11434/v1',                            default_model: 'qwen2.5:7b',              json_mode: false },
  lmstudio:    { name: 'LM Studio',       base_url: 'http://localhost:1234/v1',                             default_model: 'local-model',              json_mode: false },
};

// ======================================================================
// 核心函数
// ======================================================================

/**
 * 构建完整的 System Prompt
 */
function buildPrompt({ scene = 'icebreaker', styles = ['gentle', 'humorous', 'direct'], userPersonality = '内向温和', extraContext = '' } = {}) {
  const styleInstructions = styles.map((styleKey, i) => {
    const style = REPLY_STYLES[styleKey] || REPLY_STYLES.gentle;
    return `### 回复展示方式 ${i + 1}：${style.name}\n${style.instruction}`;
  }).join('\n\n');

  const sceneData = SCENE_PROMPTS[scene] || SCENE_PROMPTS.icebreaker;

  let prompt = `${BASE_PERSONA}

${sceneData.prompt}

## 用户性格背景（回复时请贴合此性格）
${userPersonality}

## 输出要求
请根据对方最后发的消息，生成 ${styles.length} 种不同风格的回复建议。

${styleInstructions}

## 强制输出格式 (必须严格遵守 JSON)
请直接输出一个纯 JSON 对象，不要包含任何前导说明、Markdown 语法块或结尾总结。你的整个响应内容必须只能是一个合法的 JSON。

JSON 结构示例：
{
    "analysis": "对当下聊天局势的洞察（40字内）",
    "replies": [
        {
            "style": "风格名称",
            "content": "具体的回复内容",
            "tip": "心法/技巧解析"
        }
    ],
    "warnings": ["如果消息中有坑或风险，请指出，否则为空数组"],
    "next_topic": "后续如何延续或推进关系的建议"
}

请确保所有字符串中的特殊字符（如换行、引号）按照 JSON 标准进行转义。`;

  if (extraContext) {
    prompt += `\n\n## 额外背景补全\n${extraContext}`;
  }

  return prompt;
}

/**
 * 检查用户输入的情商预警
 */
function checkEqWarnings(userInput) {
  const warnings = [];
  for (const rule of EQ_WARNING_RULES) {
    for (const trigger of rule.triggers) {
      if (userInput.includes(trigger)) {
        warnings.push({ trigger, warning: rule.warning, suggestion: rule.suggestion });
        break;
      }
    }
  }
  return warnings;
}

/**
 * 调用 OpenAI 兼容 API
 */
async function callAI(baseUrl, apiKey, modelName, systemPrompt, userMessage, supportsJsonMode = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const body = {
    model: modelName,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `对方最新消息：「${userMessage}」\n\n请直接返回 JSON 格式的回复建议：` }
    ],
    temperature: 0.7,
    max_tokens: 2000,
  };

  // 如果 provider 支持，开启强制 JSON 模式（部分模型不开启反而更稳定）
  if (supportsJsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`API 异常 (状态码 ${response.status}): ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content.trim();

  // 清洗响应内容（去除 markdown 包装代码块）
  if (content.startsWith('```')) {
    content = content.replace(/^```(json)?\s*/, '').replace(/\s*```$/, '');
  }

  try {
    return JSON.parse(content);
  } catch (e) {
    // 深度搜索字符串中的第一个 { 和最后一个 }
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const potentialJson = content.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(potentialJson);
      } catch (innerError) {
        console.error('JSON Parsing failed even after extraction:', innerError);
      }
    }
    
    // 最终保底：尝试将纯文本转成结构
    return {
      analysis: 'AI 响应解析异常',
      replies: [{ 
        style: '原始响应', 
        content: content.slice(0, 100) + (content.length > 100 ? '...' : ''), 
        tip: '由于模型返回格式非标准 JSON，暂无法完全解析。请尝试换一个模型或检查 API 设置。' 
      }],
      warnings: ['解析失败，原始文本：' + content.slice(0, 50)],
      next_topic: '无法解析建议'
    };
  }
}

// ======================================================================
// 导出
// ======================================================================

export {
  SCENE_PROMPTS,
  REPLY_STYLES,
  EQ_WARNING_RULES,
  TEST_CASES,
  PRESET_PROVIDERS,
  buildPrompt,
  checkEqWarnings,
  callAI,
};
