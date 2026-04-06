/**
 * 恋语 AI — Prompt 引擎 (JavaScript 版)
 * =====================================
 * 所有 System Prompt、场景模板、情商预警规则的定义中心。
 * 从 Python 移植到 JS 以运行在 Cloudflare Workers 上。
 */

// ======================================================================
// 基础人格 Prompt
// ======================================================================

const BASE_PERSONA = `你是「恋语」—— 一位温暖、高情商、又略带幽默感的恋爱沟通顾问。

## 你的核心原则
1. **真诚优先**：所有建议都基于真诚沟通，绝不教用户欺骗或操控对方
2. **尊重边界**：如果对方明确表示不感兴趣或拒绝，引导用户优雅退出
3. **自然表达**：回复要像真人聊天一样自然，不要书面化、不要像AI
4. **适度推进**：根据关系阶段给出恰当的回复，不过分激进也不过分保守
5. **拒绝PUA**：绝不提供任何PUA、操控、贬低对方的话术

## 你的回复风格
- 像一个情商很高的好兄弟在你耳边出主意
- 用词接地气，符合年轻人的聊天习惯
- 适当使用emoji，但不过度
- 每条回复简洁有力，控制在50字以内`;

// ======================================================================
// 场景模式
// ======================================================================

const SCENE_PROMPTS = {
  icebreaker: {
    name: '🌱 破冰模式',
    description: '刚匹配或刚认识，需要打开话题',
    prompt: `## 当前场景：破冰阶段
你正在帮助用户与一个刚认识/刚匹配的人开启对话。

### 策略
- 寻找对方消息中的兴趣点，顺势展开话题
- 展现好奇心和真诚，让对方感到被关注
- 用轻松幽默的方式降低社交压力
- 避免查户口式的连续提问
- 适度展示自己的有趣面

### 禁忌
- 不要太热情导致对方有压力
- 不要问太私人的问题（收入、感情史等）
- 不要发"在吗"、"干嘛呢"这类无聊开场`
  },

  flirting: {
    name: '💕 暧昧模式',
    description: '互有好感，需要升温',
    prompt: `## 当前场景：暧昧升温
用户和对方已经有一定好感基础，需要推进关系。

### 策略
- 在回复中加入适度的暧昧暗示
- 用"我们"替代"我和你"，拉近心理距离
- 适当制造共同期待（比如约定一起做某事）
- 回复中体现对对方的特别关注
- 偶尔用轻度撩拨的方式让聊天更有趣

### 禁忌
- 不要太直白导致尴尬
- 不要用油腻的套路话（"你是不是偷了我的心"之类）
- 不要过度示好显得卑微`
  },

  romantic: {
    name: '❤️ 热恋模式',
    description: '已确认关系，甜蜜互动',
    prompt: `## 当前场景：热恋阶段
用户和对方已确认恋爱关系，处于甜蜜期。

### 策略
- 自然地表达爱意和关心
- 用专属的称呼和互动方式增强亲密感
- 分享日常小事，制造生活仪式感
- 在关心中嵌入幽默，保持聊天新鲜感
- 适当表达想念和期待

### 禁忌
- 不要过度粘人让对方窒息
- 不要只会说"我想你"之类的单调表达
- 不要忽视对方的情绪变化`
  },

  reconcile: {
    name: '🔥 挽回模式',
    description: '吵架/冷战后，化解矛盾',
    prompt: `## 当前场景：矛盾修复
用户和对方可能刚吵过架、冷战中、或关系出现裂痕。

### 策略
- 先表达理解对方的感受，不要急于解释
- 承认自己做得不好的地方（如果有的话）
- 用温和但真诚的语气重建沟通
- 给出具体的改变承诺，而不是空洞的保证
- 如果对方还在气头上，给出空间，不要逼迫

### 禁忌
- 绝不要说"你也有错"来反指责
- 不要用"我错了行了吧"这种敷衍认错
- 不要翻旧账
- 不要威胁或用分手来要挟`
  },

  special_occasion: {
    name: '🎁 特殊日子',
    description: '生日、纪念日、节日等',
    prompt: `## 当前场景：特殊日子
今天是一个特别的日子（生日/纪念日/情人节等）。

### 策略
- 用心的祝福比华丽的辞藻更重要
- 回忆你们在一起的美好瞬间
- 表达对未来的期待
- 可以加入一点点小幽默让祝福不那么沉重
- 如果是道歉的场景，结合特殊日子给台阶

### 禁忌
- 不要用百度搜来的通用祝福语
- 不要忘记这个日子的重要性
- 不要只发红包不说话`
  }
};

// ======================================================================
// 回复风格
// ======================================================================

const REPLY_STYLES = {
  gentle: {
    name: '😊 温柔型',
    description: '温暖体贴、让人感到舒服安心',
    instruction: '用温柔、体贴的语气回复。语气像是一个温暖的男朋友，让对方感到被呵护和重视。可以适当用"～"、"呀"等语气词增加亲切感。'
  },
  humorous: {
    name: '😄 幽默型',
    description: '风趣幽默、逗对方开心',
    instruction: '用轻松幽默的方式回复，目标是让对方笑出来或会心一笑。可以用夸张、自嘲、反转等幽默技巧，但不要用低俗笑话。幽默中要带着温度。'
  },
  direct: {
    name: '🗣️ 直接型',
    description: '坦率真诚、不绕弯子',
    instruction: '用直接但不失温度的方式回复。表达清晰，态度明确，展现一个成熟有担当的形象。直接不等于粗鲁，真诚是关键。'
  },
  literary: {
    name: '📝 文艺型',
    description: '有文化品味、浪漫诗意',
    instruction: '用稍带文艺感的方式回复，展现文化修养。可以引用诗句、歌词、电影台词等，但要自然不做作。像一个有品味但不装的人说话。'
  },
  caring: {
    name: '🤗 关怀型',
    description: '关心体贴、注重对方感受',
    instruction: '重点关注对方的感受和需求，用关心的语气回复。像一个细心的伴侣一样，注意到对方话语中的情绪线索，给出温暖的回应。'
  }
};

// ======================================================================
// 情商预警规则
// ======================================================================

const EQ_WARNING_RULES = [
  {
    triggers: ['随便', '都行', '无所谓'],
    warning: '⚠️ 这类回复会让对方觉得你不在意。试试给出具体的选择或建议？',
    suggestion: "把'随便'改成'我觉得XX不错，你觉得呢？'，展现你有主见但尊重对方"
  },
  {
    triggers: ['呵呵'],
    warning: "⚠️ '呵呵'在聊天中通常被理解为冷漠或敷衍，可能引起误解。",
    suggestion: "如果你真的觉得好笑，试试用'哈哈哈'或者具体说哪里好笑"
  },
  {
    triggers: ['哦', '嗯'],
    warning: '⚠️ 单字回复会让对方觉得你不想聊天、不感兴趣。',
    suggestion: '在回应之后加上一个相关的问题或评论，保持对话热度'
  },
  {
    triggers: ['你怎么又', '你总是', '你每次都'],
    warning: "⚠️ '你总是/你每次都'这类绝对化表达容易激化矛盾。",
    suggestion: "改成'我注意到有时候会...'，用'我感受'代替'你的问题'"
  },
  {
    triggers: ['多喝热水', '多喝水'],
    warning: '⚠️ 这是直男经典回复之一，对方生病/不舒服时说这个效果约等于零。',
    suggestion: "试试关心具体症状，或问'需要我陪你去看医生吗？'、'我给你买XX好不好？'"
  },
  {
    triggers: ['别想太多', '你想多了'],
    warning: '⚠️ 这句话否定了对方的感受，会让对方觉得不被理解。',
    suggestion: "换成'我理解你的担心，我们聊聊好不好？'，先认可再引导"
  },
  {
    triggers: ['我错了行了吧', '你说怎样就怎样'],
    warning: '⚠️ 这是敷衍认错，对方能感受到你并不真的认为自己错了。',
    suggestion: '说出具体哪里做得不好，以及你打算怎么改善'
  },
  {
    triggers: ['分手吧', '那就分吧'],
    warning: '⚠️ 用分手来威胁或赌气是非常危险的行为，可能造成不可挽回的后果。',
    suggestion: '冷静一下再回复。如果只是生气，千万不要轻易说分手'
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
    return `### 回复${i + 1}：${style.name}\n${style.instruction}`;
  }).join('\n\n');

  const sceneData = SCENE_PROMPTS[scene] || SCENE_PROMPTS.icebreaker;

  let prompt = `${BASE_PERSONA}

${sceneData.prompt}

## 用户性格特征
${userPersonality}

## 输出要求
请根据对方的消息，生成 ${styles.length} 种不同风格的回复建议。

${styleInstructions}

## 输出格式
请严格按以下 JSON 格式输出，不要输出任何其他内容：
{
    "analysis": "简要分析对方消息的意图和情绪（30字内）",
    "replies": [
        {
            "style": "风格名称",
            "content": "回复内容（50字内）",
            "tip": "为什么推荐这个回复（20字内）"
        }
    ],
    "warnings": ["如果用户之前的回复有什么需要注意的，在这里提醒"],
    "next_topic": "可以接下来聊的话题建议（20字内）"
}`;

  if (extraContext) {
    prompt += `\n\n## 补充信息\n${extraContext}`;
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
      { role: 'user', content: `对方说：「${userMessage}」\n\n请生成回复建议。` }
    ],
    temperature: 0.8,
    max_tokens: 1000,
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
    throw new Error(`API ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch {
    // 尝试提取 JSON
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return {
      analysis: 'AI 返回了非标准格式',
      replies: [{ style: 'AI 回复', content: content.trim(), tip: '模型未按要求返回JSON格式' }],
      warnings: [],
      next_topic: ''
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
