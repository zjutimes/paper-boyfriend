import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

// GET: 获取照片的签名URL
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: '缺少文件key参数' },
        { status: 400 }
      );
    }

    // 检查文件是否存在
    const exists = await storage.fileExists({ fileKey: key });
    if (!exists) {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      );
    }

    // 生成签名URL（默认有效期1天）
    const expireTime = parseInt(searchParams.get('expireTime') || '86400');
    const signedUrl = await storage.generatePresignedUrl({
      key: key,
      expireTime: expireTime,
    });

    return NextResponse.json({
      success: true,
      key: key,
      url: signedUrl,
      expiresIn: expireTime,
    });

  } catch (error) {
    console.error('Get photo URL error:', error);
    return NextResponse.json(
      { error: '获取照片失败' },
      { status: 500 }
    );
  }
}
