import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

// DELETE: 删除照片
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: '缺少文件key参数' },
        { status: 400 }
      );
    }

    // 删除文件
    const success = await storage.deleteFile({ fileKey: key });

    if (success) {
      return NextResponse.json({
        success: true,
        message: '删除成功',
        key: key,
      });
    } else {
      return NextResponse.json(
        { error: '删除失败，文件可能不存在' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Delete photo error:', error);
    return NextResponse.json(
      { error: '删除失败' },
      { status: 500 }
    );
  }
}
