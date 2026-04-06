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

## 输出格式
请严格按以下 JSON 格式输出，不要输出任何其他内容。
其中 replies 数组中的每一项都必须包含 style（风格名称）、content（回复内容）、tip（回复理由/技巧）。
此外，请务必返回一个整体的 analysis 和 next_topic。

{
    "analysis": "简要解析对方话语背后的潜台词、情绪或当前关系的处境（40字内）",
    "replies": [
        {
            "style": "风格名称",
            "content": "具体的对话内容（50字内）",
            "tip": "祖师爷洞察：分析这条回复为什么有效，以及运用的心法"
        }
    ],
    "warnings": ["如果对方话语中有陷阱或高风险信号，在这里给出警告"],
    "next_topic": "后续如何延续话题或推进关系的建议"
}`;

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
      { role: 'user', content: `对方最新消息：「${userMessage}」\n\n请作为恋爱顾问生成回复建议。` }
    ],
    temperature: 0.8,
    max_tokens: 1500,
  };

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
  const content = data.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch {
    // 尝试在返回内容中寻找 JSON 结构
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    
    // 如果实在不是 JSON，也返回一个结构化的兼容格式
    return {
      analysis: 'AI 响应格式解析失败',
      replies: [{ style: '原始输出', content: content.trim(), tip: '模型未按 JSON 要求返回，请参考此原生响应' }],
      warnings: ['由于模型响应非标准 JSON，格式可能混乱'],
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
