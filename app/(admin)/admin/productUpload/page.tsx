'use client';
import React, { useEffect, useState } from 'react'
import { useGet } from '@/app/_lib/hooks/useGet';

type Category = {
    _id: string;
    mainCategory: string;
    subCategories: {
        name: string;
        subSubCategories: string[];
    }[];
};

function Page() {
    const [form, setForm] = useState({
        brand: '',
        filterCategories: "",
        title: '',
        heading: '',
        category: '',
        subCategory: '',
        subSubCategory: '',
        description: '',
        price: '',
        originalPrice: '',
        discount: '',
        rating: '',
        reviews: '',
        stock: '',
        seller: '',
        productLink: '',
    });
    const { data: categories, loading: categoriesLoading } = useGet<Category[]>("/api/categories", []);

    const [sizes, setSizes] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [message, setMessage] = useState<string>("");
    const [brands, setBrands] = useState<string[]>([]);
    const [filterCategories, setFilterCategories] = useState<string[]>([]);

    const selectedCategory = categories.find((category) => category._id === form.category);
    const availableSubCategories = selectedCategory?.subCategories ?? [];
    const selectedSubCategory = availableSubCategories.find((subCategory) => subCategory.name === form.subCategory);
    const availableSubSubCategories = selectedSubCategory?.subSubCategories ?? [];
    const selectedSubSubCategory = availableSubSubCategories.find((subSubCategory) => subSubCategory === form.subSubCategory);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === "category") { setForm((prev) => ({ ...prev, category: value, subCategory: "", subSubCategory: "", })); return; }
        if (name === "subCategory") { setForm((prev) => ({ ...prev, subCategory: value, subSubCategory: "", })); return; }
        const updatedData = { ...form, [name]: value };

        const originalPrice = Number(updatedData.originalPrice);
        const discount = Number(updatedData.discount);

        if (originalPrice && discount) {
            const price = originalPrice - (originalPrice * discount) / 100;
            updatedData.price = price.toFixed(2);
        }

        setForm(updatedData);
    };

    useEffect(() => {
        if (
            !selectedCategory ||
            !selectedSubCategory ||
            !selectedSubSubCategory
        )
            return;

        fetch(`/api/filter?category=${form.category}&subCategory=${form.subCategory}&subSubCategory=${form.subSubCategory}`)
            .then((res) => res.json())
            .then((data) => {
                setBrands(
                    data.brands || []
                );
                setFilterCategories(
                    data.categories || []
                )
            });
    }, [
        form.category,
        form.subCategory,
        form.subSubCategory,
        selectedCategory,
        selectedSubCategory,
        selectedSubSubCategory,
    ]);

    const handleSizeChange = (size: string) => {
        setSizes((prev) =>
            prev.includes(size)
                ? prev.filter((s) => s !== size)
                : [...prev, size]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();

        // text fields
        Object.entries(form).forEach(([key, value]) => {
            formData.append(key, value);
        });

        // sizes
        sizes.forEach((size) => formData.append('sizes', size));

        // ✅ FIXED FILE UPLOAD
        files.forEach((file) => {
            formData.append('prdctImages', file);
        });

        try {
            const res = await fetch('/api/product-upload', {
                method: 'POST',
                body: formData,
            });

            const raw = await res.text();
            let data: { message?: string } | null = null;

            if (raw) {
                try {
                    data = JSON.parse(raw) as { message?: string };
                } catch {
                    data = null;
                }
            }

            if (!res.ok) {
                console.error("Product upload failed:", data?.message ?? raw ?? "Unknown error");
                return;
            }

            if (data?.message) {
                setMessage(data.message);
            }

            console.log("Product uploaded:", data);

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="adminPanel">
            <div className="adminPanelContainer" >

                <h2 className="formTitle">Add Product</h2>

                <form className="productForm" encType="multipart/form-data" onSubmit={handleSubmit}>

                    <div className="formSection">
                        <h3>Basic Information</h3>
                        <div className="formSection">
                            <h3>Product Category</h3>
                            <div className="formRow">
                                <div className="formGroup">
                                    <label>Category</label>
                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            {categoriesLoading ? "Loading categories..." : "Select category"}
                                        </option>
                                        {categories.map((category) => (
                                            <option key={category._id} value={category._id}>
                                                {category.mainCategory}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="formGroup">
                                    <label>Sub Category</label>
                                    <select name="subCategory" value={form.subCategory} onChange={handleChange} required disabled={!form.category} >
                                        <option value="">
                                            {!form.category ? "Select category first" : "Select sub category"}
                                        </option>
                                        {availableSubCategories.map((subCategory) => (
                                            <option key={subCategory.name} value={subCategory.name}>
                                                {subCategory.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="formGroup">
                                    <label>Sub Sub Category</label>
                                    <select name="subSubCategory" value={form.subSubCategory} onChange={handleChange} required disabled={!form.subCategory} >
                                        <option value="">
                                            {!form.subCategory ? "Select sub category first" : "Select sub sub category"}
                                        </option>
                                        {availableSubSubCategories.map((subSubCategory) => (
                                            <option key={subSubCategory} value={subSubCategory}>
                                                {subSubCategory}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="formGroup">
                            <div className="formGroup">
                                <label>Brand</label>
                                <select name="brand" value={form.brand} onChange={handleChange} required disabled={!form.subSubCategory} >
                                    <option value="">
                                        {!form.subSubCategory ? "Select all categories first" : "Select brand"}
                                    </option>
                                    {brands.map((brand, index) => (
                                        <option key={index} value={brand}>
                                            {brand}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="formGroup">
                            <label>Filter Categories</label>

                            <select
                                name="filterCategories"
                                value={form.filterCategories || ""}
                                onChange={handleChange}
                                required
                                disabled={!form.subSubCategory}
                            >
                                <option value="">
                                    {!form.subSubCategory
                                        ? "Select all categories first"
                                        : "Select Filter Category"}
                                </option>

                                {filterCategories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="formGroup">
                            <label>Title</label>
                            <input name="title" onChange={handleChange} type="text" placeholder="Enter product title" />
                        </div>
                    </div>


                    <div className="formSection">
                        <h3>Gallery Images</h3>

                        <div className="formGroup">
                            <input
                                type="file"
                                multiple
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setFiles(Array.from(e.target.files));
                                    }
                                }}
                            />
                        </div>
                    </div>


                    <div className="formSection">
                        <h3>Sizes</h3>

                        <div className="checkboxGroup">
                            {/* Sizes */}
                            {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                                <label key={size}>
                                    <input
                                        type="checkbox"
                                        onChange={() => handleSizeChange(size)}
                                    />
                                    {size}
                                </label>
                            ))}
                        </div>
                    </div>


                    <div className="formSection">
                        <h3>Description</h3>

                        <div className="formGroup">
                            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Enter description"></textarea>
                        </div>
                    </div>


                    <div className="formSection">
                        <h3>Pricing</h3>

                        <div className="formRow">


                            <div className="formGroup">
                                <label>Original Price</label>
                                <input
                                    name="originalPrice"
                                    type="number"
                                    value={form.originalPrice}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="formGroup">
                                <label>Discount (%)</label>
                                <input
                                    name="discount"
                                    type="number"
                                    value={form.discount}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="formGroup">
                                <label>Price</label>
                                <input
                                    name="price"
                                    type="number"
                                    value={form.price}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>


                    <div className="formSection">
                        <h3>Other Details</h3>

                        <div className="formRow">
                            <div className="formGroup">
                                <label>Rating</label>
                                <input name="rating" onChange={handleChange} type="number" step="0.1" />
                            </div>

                            <div className="formGroup">
                                <label>Reviews</label>
                                <input name="reviews" onChange={handleChange} type="number" />
                            </div>

                            <div className="formGroup">
                                <label>Stock</label>
                                <input name="stock" onChange={handleChange} type="number" />
                            </div>
                        </div>

                        <div className="formGroup">
                            <label>Seller</label>
                            <input name="seller" onChange={handleChange} type="text" />
                        </div>
                    </div>


                    <div className="formSubmit">
                        <button type="submit">Save Product</button>
                    </div>
                    {message && <p>{message}</p>}
                </form>
            </div>
        </div>

    )
}

export default Page
