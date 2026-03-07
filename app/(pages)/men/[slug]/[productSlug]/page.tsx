"use client";
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { useParams } from 'next/navigation';
import { MdOutlineStarPurple500 } from "react-icons/md";

type ProductItem = {
    _id?: string;
    brand: string;
    title: string;
    galleryImages?: string[];
    rating: number;
    reviews: number;
    price: number;
    originalPrice?: number;
    discount?: number;
};

type Category = {
    _id: string;
    mainCategory: string;
    subCategories: {
        name: string;
        subSubCategories?: string[];
    }[];
};

const toSlug = (value: string) => value.toLowerCase().trim().replace(/\s+/g, "-");
const normalizeParam = (param: string | string[] | undefined) =>
    Array.isArray(param) ? param[0] : param ?? "";

function Page() {
    const params = useParams();
    const slug = normalizeParam(params?.slug);
    const productSlug = normalizeParam(params?.productSlug);

    const [tshirtData, setTshirtData] = useState<ProductItem[]>([]);
    const [isRouteValid, setIsRouteValid] = useState(false);
    const [routeChecked, setRouteChecked] = useState(false);

    console.log("Fetched T-shirt Data:", tshirtData);

    React.useEffect(() => {
        const validateRouteAndFetch = async () => {
            try {
                const categoriesResponse = await fetch("/api/categories");
                const categories: Category[] = await categoriesResponse.json();

                const matchedCategory = categories.find(
                    (category) =>
                        toSlug(category.mainCategory) === "men" &&
                        category.subCategories.some((subCategory) => toSlug(subCategory.name) === slug)
                );
                const matchedSubCategory = matchedCategory?.subCategories.find(
                    (subCategory) => toSlug(subCategory.name) === slug
                );
                const matchedSubSubCategory = matchedSubCategory?.subSubCategories?.find(
                    (subSubCategory) => toSlug(subSubCategory) === productSlug
                );
                const isValid = Boolean(matchedCategory && matchedSubCategory && matchedSubSubCategory);

                setIsRouteValid(isValid);

                if (!isValid) {
                    setTshirtData([]);
                    return;
                }

                const query = new URLSearchParams({
                    categoryId: matchedCategory!._id,
                    subCategory: matchedSubCategory!.name,
                    subSubCategory: matchedSubSubCategory!,
                });
                const response = await fetch(`/api/product-upload?${query.toString()}`);
                const data = await response.json();
                setTshirtData(data);
            } catch (error) {
                console.error("Error fetching t-shirt data:", error);
                setIsRouteValid(false);
            } finally {
                setRouteChecked(true);
            }
        };

        validateRouteAndFetch();
    }, [slug, productSlug]);

    if (!routeChecked) {
        return <div className="pad100 container">Loading products...</div>;
    }

    if (!isRouteValid) {
        return (
            <div className="pad100 container">
                <h2>Page not found</h2>
                <Link href="/">Back to home</Link>
            </div>
        );
    }

    return (
        <div className='padt10'>
            <div className='container'>
                <div className="mainTitle">
                    <h6>Men T-shirts - <span className='normal'>263564 items</span></h6>
                </div>
                <div className="allCategoriesSection">
                    <div className="filterSideBar">
                        <h5 className='titleText'>Filter</h5>
                        <div className="filterCategories">
                            <h6>Categories</h6>
                            <div className="checkboxField">
                                <div className="checkboxInput">
                                    <input type="checkbox" name="categories" id="tshirt" />
                                    <label htmlFor="tshirt">Tshirts(262061)</label>
                                </div>
                                <div className="checkboxInput">
                                    <input type="checkbox" name="categories" id="longeTshirt" />
                                    <label htmlFor="longeTshirt">Lounge Tshirts(1530)</label>
                                </div>
                            </div>
                        </div>
                        <div className="filterCategories">
                            <h6>Brand</h6>
                            <div className="checkboxField">
                                <div className="checkboxInput">
                                    <input type="checkbox" name="brand" id="woostro" />
                                    <label htmlFor="woostro">WOOSTRO(9437)</label>
                                </div>
                                <div className="checkboxInput">
                                    <input type="checkbox" name="brand" id="brand2" />
                                    <label htmlFor="brand2">Moda Rapido(7190)</label>
                                </div>
                                <div className="checkboxInput">
                                    <input type="checkbox" name="brand" id="brand3" />
                                    <label htmlFor="brand3">SZN(5809)</label>
                                </div>
                                <div className="checkboxInput">
                                    <input type="checkbox" name="brand" id="brand4" />
                                    <label htmlFor="brand4">Seekbuylove(5067)</label>
                                </div>
                                <div className="checkboxInput">
                                    <input type="checkbox" name="brand" id="brand5" />
                                    <label htmlFor="brand5">Roadster(4546)</label>
                                </div>
                                <div className="checkboxInput">
                                    <input type="checkbox" name="brand" id="brand6" />
                                    <label htmlFor="brand6">HRX by Hrithik Roshan(4145)</label>
                                </div>
                                <div className="checkboxInput">
                                    <input type="checkbox" name="brand" id="brand7" />
                                    <label htmlFor="brand7">Tommy Hilfiger(4095)</label>
                                </div>
                                <div className="checkboxInput">
                                    <input type="checkbox" name="brand" id="brand8" />
                                    <label htmlFor="brand8">Friskers(3994)</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="categoriesSection">
                        {tshirtData.length > 0 ? tshirtData.map((item, index) => {
                            const firstImageId = item.galleryImages?.[0];
                            const productDetailsSlug = item._id
                                ? `${toSlug(item.title)}-${item._id}`
                                : toSlug(item.title);

                            return (
                                <Link
                                    href={`/men/${slug}/${productSlug}/${productDetailsSlug}`}
                                    key={item._id ?? `${item.title}-${index}`}
                                    className="categoryCard"
                                >
                                    <div className="img">
                                        <Image
                                            src={firstImageId ? `/api/uploads/${firstImageId}` : "/images/tshirt/tshirt1.webp"}
                                            alt={item.title}
                                            width={200}
                                            height={200}
                                        />

                                        <div className="rating">
                                            <span>{item.rating} <MdOutlineStarPurple500 /> | {item.reviews}</span>
                                        </div>
                                    </div>

                                    <div className="text">
                                        <h6>{item.brand}</h6>
                                        <p>{item.title}</p>

                                        <p className="price">
                                            <b>
                                                Rs. {item.price}
                                                {item.originalPrice ? <span className="strike"> Rs. {item.originalPrice}</span> : null}
                                                {item.discount ? <span className="discount"> {item.discount}% off</span> : null}
                                            </b>
                                        </p>
                                    </div>
                                </Link>
                            )
                        }) : <p>No products found.</p>}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Page
