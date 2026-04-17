/**
 * 解析 LLM 回复，提取文字内容和图片标记
 */
export interface ParsedReply {
  text: string;
  imagePrompt: string | null;
}

export const parseReply = (reply: string): ParsedReply => {
  // 匹配 [IMAGE: ...] 标记
  const imageMatch = reply.match(/\[IMAGE:\s*(.+?)\]/);

  // 去掉图片标记，获取纯文字内容
  const textContent = reply
    .replace(/\[IMAGE:\s*.+?\]/g, '')
    .trim();

  return {
    text: textContent,
    imagePrompt: imageMatch ? imageMatch[1].trim() : null,
  };
};

/**
 * 检查回复中是否包含图片标记
 */
export const hasImageMarker = (reply: string): boolean => {
  return /\[IMAGE:\s*.+?\]/.test(reply);
};

/**
 * 增强图片生成 Prompt，确保人物一致性
 */
export const enhanceImagePrompt = (
  rawPrompt: string,
  characterAppearance: string
): string => {
  return `${characterAppearance}。${rawPrompt}。古风画风，高质量，精细，人物面部清晰。不要出现文字。`;
};
