const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.comment.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.product.deleteMany({});

  console.log('기존 데이터 삭제 완료.');

  const article1 = await prisma.article.create({
    data: {
      title: '첫 번째 게시글입니다.',
      content: '자유게시판에 오신 것을 환영합니다! 이것은 첫 번째 게시글 내용입니다.',
    },
  });
  const article2 = await prisma.article.create({
    data: {
      title: '두 번째 게시글: Prisma 사용법',
      content: 'Prisma를 사용한 데이터베이스 연동은 정말 편리하네요.',
    },
  });
  console.log(`생성된 게시글: ${article1.id}, ${article2.id}`);


  const product1 = await prisma.product.create({
    data: {
      name: '프리미엄 무선 이어폰',
      description: '최고급 음질과 노이즈 캔슬링 기능을 갖춘 무선 이어폰입니다.',
      price: 150000.00,
      tags: ['이어폰', '무선', '음향기기'],
      images: ['https://example.com/earbuds1.jpg', 'https://example.com/earbuds2.jpg'],
      manufacturer: 'SoundPro',
      recommendedScore: 95,
    },
  });
  const product2 = await prisma.product.create({
    data: {
      name: '인체공학 무접점 키보드',
      description: '장시간 타이핑에도 손목이 편안한 최고급 키보드입니다.',
      price: 280000.00,
      tags: ['키보드', '무접점', '사무용품'],
      images: ['https://example.com/keyboard1.jpg'],
      manufacturer: 'ErgoTech',
      recommendedScore: 92,
    },
  });
  console.log(`생성된 상품: ${product1.id}, ${product2.id}`);

  await prisma.comment.create({
    data: {
      content: '첫 번째 게시글에 달린 멋진 댓글입니다.',
      articleId: article1.id, // article1에 연결
    },
  });
  await prisma.comment.create({
    data: {
      content: '두 번째 게시글이 더 유용하네요!',
      articleId: article2.id, // article2에 연결
    },
  });
  await prisma.comment.create({
    data: {
      content: '이 이어폰 정말 갖고 싶어요!',
      productId: product1.id, // product1에 연결
    },
  });
  await prisma.comment.create({
    data: {
      content: '키보드 타건감이 궁금하네요.',
      productId: product2.id, // product2에 연결
    },
  });
  console.log('댓글 데이터 생성 완료.');

  console.log('Seed 데이터 생성이 완료되었습니다.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
