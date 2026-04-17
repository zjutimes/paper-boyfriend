import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

// GET: 获取用户的照片列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const maxKeys = parseInt(searchParams.get('maxKeys') || '50');

    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID参数' },
        { status: 400 }
      );
    }

    // 列出该用户的照片
    const result = await storage.listFiles({
      prefix: `photos/${userId}/`,
      maxKeys: maxKeys,
    });

    // keys 是字符串数组，每个元素是文件key
    const keyList = (result.keys || []) as unknown as string[];

    // 为每个文件生成签名URL
    const photos = await Promise.all(
      keyList.map(async (key: string) => {
        const signedUrl = await storage.generatePresignedUrl({
          key: key,
          expireTime: 3600, // 1小时
        });
        return {
          key: key,
          url: signedUrl,
          size: 0,
          lastModified: '',
        };
      })
    );

    return NextResponse.json({
      success: true,
      photos: photos,
      isTruncated: result.isTruncated,
      nextCursor: result.nextContinuationToken,
    });

  } catch (error) {
    console.error('List photos error:', error);
    return NextResponse.json(
      { error: '获取照片列表失败' },
      { status: 500 }
    );
  }
}
