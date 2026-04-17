import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: '没有上传文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的图片格式' },
        { status: 400 }
      );
    }

    // 验证文件大小 (最大 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '图片大小不能超过10MB' },
        { status: 400 }
      );
    }

    // 转换文件为Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 生成文件名：photos/{userId}/{timestamp}.{ext}
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = userId 
      ? `photos/${userId}/${timestamp}.${extension}`
      : `photos/anonymous/${timestamp}.${extension}`;

    // 上传文件
    const fileKey = await storage.uploadFile({
      fileContent: buffer,
      fileName: fileName,
      contentType: file.type,
    });

    // 生成签名URL（有效期7天）
    const signedUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 7 * 24 * 60 * 60, // 7天
    });

    return NextResponse.json({
      success: true,
      key: fileKey,
      url: signedUrl,
      fileName: file.name,
      size: file.size,
      type: file.type,
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: '上传失败，请重试' },
      { status: 500 }
    );
  }
}
