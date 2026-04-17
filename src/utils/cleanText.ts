/**
 * 清理文本，准备用于 TTS 语音合成
 * 移除各种标记、括号、特殊符号
 */
export const cleanTextForSpeech = (text: string): string => {
  return text
    // 去掉图片标记
    .replace(/\[IMAGE:\s*.+?\]/g, '')
    // 去掉中文括号及其内容
    .replace(/（[^）]*）/g, '')
    // 去掉英文括号及其内容
    .replace(/\([^)]*\)/g, '')
    // 去掉中括号及其内容
    .replace(/\[[^\]]*\]/g, '')
    // 去掉其他中文引号
    .replace(/[「」『』]/g, '')
    // 去掉书名号
    .replace(/《》/g, '')
    // 去掉特殊符号，保留基本标点
    .replace(/[#*_~`]/g, '')
    // 合并多个空格
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * 检查清理后的文本是否为空
 */
export const isTextEmptyAfterCleaning = (text: string): boolean => {
  return cleanTextForSpeech(text).length === 0;
};

/**
 * 将长文本拆分成适合 TTS 的短片段
 * 每段不超过约15秒的语音长度（按中文约50字）
 */
export const splitTextForTTS = (text: string, maxChars: number = 50): string[] => {
  const cleanedText = cleanTextForSpeech(text);

  if (cleanedText.length <= maxChars) {
    return [cleanedText];
  }

  const sentences = cleanedText.split(/[，。！？、；]/).filter(Boolean);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxChars) {
      currentChunk += sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [cleanedText];
};
