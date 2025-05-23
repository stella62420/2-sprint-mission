import { getArticleList, getArticle, createArticle, patchArticle, deleteArticle } from './ArticleService.js';
import { getProductList, getProduct, createProduct, patchProduct, deleteProduct } from './ProductService.js';


class Product {
  constructor(name, description, price, tags,images, favoriteCount = 0){
    this.name = name;
    this.description = description;
    this.price = price;
    this.tags = tags;
    this.images = images;
    this.favoriteCount = favoriteCount;
  }

 
 get price() {    
  return this._price;
 }

  set price(newPrice) {
   if (newPrice > 0) {
      this._price = newPrice;
    } else {
    console.log('가격에 들어가는 숫자는 0보다 커야 합니다.')
    this._price = 0;    // 유효하지 않는 값이 들어오는 경우 명시적으로 0으로 설정
  }
 }


  favorite() {
    this.favoriteCount ++; 
  }
}



class ElectronicProduct extends Product { 
  constructor(name, description, price, tags,images, favoriteCount, manufacturer){
    super (name, description, price, tags,images, favoriteCount);
    this.manufacturer = manufacturer;
    this.recommendedScore = recommendedScore;
  }


  favorite() {    
    this.recommendedScore ++;   //추천점수 1개씩 증가 추가
    this.favoriteCount ++;      //favoriteCount 1개씩 증가로 변경
  }
}



class Article { 
  #createdAt

  constructor(title, content, writer, likecount) {
    this.title = title;
    this.content = content;
    this.writer = writer;
    this.likeCount = likecount;
    this.#createdAt = new Date(); 
  }

  like( ){
    this.likeCount++;    //likeconunt → likeCount 오타 수정
  }
}


const articleData = {
  title: "게시글 제목입니다.",
  content: "게시글 내용입니다.",
  image: "https://example.com/...",
};

function ArticleServiceData() {
  getArticleList({ page: 10, pageSize: 10, keyword: '제목' })
    .then(articleListWithKeyword => {
      console.log(articleListWithKeyword);
      return getArticle(436); 
    })
    .then(singleArticle => {
      console.log(singleArticle);
      return createArticle(articleData);
    })
    .then(newArticle => {
      console.log(newArticle);
      return patchArticle(437, { title: "수정" }); 
    })
    .then(fixArticle => {
      console.log(fixArticle);
      return deleteArticle(439); 
    })
    .then(deletArticle => {
      console.log(deletArticle);
    })
    .catch(error => {
      console.log('게시글 관련 작업 중 오류가 발생했습니다');
      console.error(error);
    });
}

ArticleServiceData();




async function ProductServiceData() {
  try {
    const response = await getProductList({ page: 1, pageSize: 10, keyword: '제품' });
    console.log(response);

    const productList = response.list;
    console.log(productList);

    const products = [];
    for (const productData of productList) {
      const tagsArray = Array.isArray(productData.tags) ? productData.tags : [];
      if (tagsArray.includes('전자제품')) {
        const electronicProduct = new ElectronicProduct(
          productData.name,
          productData.description,
          productData.price,
          tagsArray,
          productData.images,
          productData.favoriteCount,
          productData.recommendedScore
        );
        products.push(electronicProduct);
      } else {
        const product = new Product(
          productData.name,
          productData.description,
          productData.price,
          tagsArray,
          productData.images,
          productData.favoriteCount
        );
        products.push(product);
      }
    }

    console.log(products);


    const singleProduct = await getProduct(10);
    console.log(singleProduct);

    const newProductData = {
      images: ['https://example.com/...'],
      tags: ['전자제품'],
      price: 1000,
      description: 'string',
      name: '상품 이름',
    };

    const createdProduct = await createProduct(newProductData);
    console.log(createdProduct);
    const newProductId = createdProduct._id;

    const fixProduct = await patchProduct(10, { tags: ["수정"] });   //문자열 -> []배열 변경
    console.log(fixProduct);

    const deletedProduct = await deleteProduct(7);
    console.log(deletedProduct);

  } catch (error) {
    console.error('상품 관련 작업 중 오류가 발생 했습니다.:', error);
  }
}

ProductServiceData();