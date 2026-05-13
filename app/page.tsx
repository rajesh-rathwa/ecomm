import Image from "next/image";
import Link from "next/link";

const homeProducts = Array.from({ length: 13 }, (_, index) => ({
  id: index + 1,
  src: `/images/home/product-${index + 1}.webp`,
}));

export default function Home() {
  return (
    <>
      <div className="container">
        <div className="shopbyCategorySection">
          <div className="mainTitle">
            <h2>Shop By Category</h2>
          </div>
          <div className="categorySection">
            {homeProducts.map((product) => (
              <div className="caregoryCard" key={product.id}>
                <Link href="#">
                  <Image
                    src={product.src}
                    alt={`Shop category product ${product.id}`}
                    width={300}
                    height={420}
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
