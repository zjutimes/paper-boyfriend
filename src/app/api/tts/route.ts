import { NextRequest, NextResponse } from 'next/server';
import { TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const config = new Config();

export async function POST(request: NextRequest) {
  try {
    const { text, speaker, uid } = await request.json();

    if (!text || !uid) {
      return NextResponse.json(
        { error: 'Missing required fields: text and uid' },
        { status: 400 }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new TTSClient(config, customHeaders);

    const response = await client.synthesize({
      uid,
      text,
      speaker: speaker || 'zh_male_taocheng_uranus_bigtts',
      audioFormat: 'mp3',
      sampleRate: 24000,
    });

    return NextResponse.json({
      audioUrl: response.audioUri,
      duration: Math.ceil(response.audioSize / 24000 * 8), // 估算时长
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech' },
      { status: 500 }
    );
  }
}
