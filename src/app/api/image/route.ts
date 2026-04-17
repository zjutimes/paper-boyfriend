import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const config = new Config();

export async function POST(request: NextRequest) {
  try {
    const { prompt, uid } = await request.json();

    if (!prompt || !uid) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and uid' },
        { status: 400 }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new ImageGenerationClient(config, customHeaders);

    const response = await client.generate({
      prompt,
      size: '2K',
    });

    const helper = client.getResponseHelper(response);

    if (helper.success && helper.imageUrls.length > 0) {
      return NextResponse.json({
        imageUrl: helper.imageUrls[0],
      });
    } else {
      return NextResponse.json(
        { error: helper.errorMessages[0] || 'Failed to generate image' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Image API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
