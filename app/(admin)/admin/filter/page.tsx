"use client";

import { useState } from "react";
import { useGet } from "@/app/_lib/hooks/useGet";

type Category = {
    _id: string;
    mainCategory: string;
    subCategories: {
        name: string;
        subSubCategories: string[];
    }[];
};

export default function FilterAdmin() {
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    const [selectedSubSubCategory,  setSelectedSubSubCategory] = useState("");

    const [brandInput, setBrandInput] = useState("");
    const [brands, setBrands] = useState<string[]>([]);

    const [categorysInput, setcategorysInput] = useState("");
    const [filterCategories, setfilterCategories] = useState<string[]>([]);

    const { data: categories = [], loading,  error, } = useGet<Category[]>( "/api/categories", [] );

    const currentCategory = categories.find( (item) =>  item._id.toString() === selectedCategory) || null;
    const subCategories =  currentCategory?.subCategories || [];
    const currentSubCategory = subCategories.find( (item) => item.name === selectedSubCategory ) || null;
    const subSubCategories = currentSubCategory?.subSubCategories || [];

    const addBrand = (
        e?: React.MouseEvent<HTMLButtonElement>
        ) => {
        e?.preventDefault();

        const value = brandInput.trim();

        if (!value) return;

        if (brands.includes(value)) {
            setBrandInput("");
            return;
        }

        setBrands([...brands, value]);
        setBrandInput("");
    };

    const removeBrand = (
        index: number
    ) => {
        const updated = [...brands];
        updated.splice(index, 1);
        setBrands(updated);
    };

    const addCategory = (
        e?: React.MouseEvent<HTMLButtonElement>
        ) => {
        e?.preventDefault();
        const value = categorysInput.trim();

        if (!value) return;
        if (filterCategories.includes(value)) {
            setcategorysInput("");
            return;
        }
        setfilterCategories([...filterCategories, value]);
        setcategorysInput("");
    };

    const removeCategory = (
        index: number
    ) => {
        const updated = [...filterCategories];
        updated.splice(index, 1);
        setfilterCategories(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log( filterCategories, brands);
        const payload = {
            category: selectedCategory,
            subCategory: selectedSubCategory,
            subSubCategory: selectedSubSubCategory,
            categories: filterCategories,
            brands: brands
        };

        const res = await fetch("/api/filter", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.success) {
            setSelectedCategory("");
            setSelectedSubCategory("");
            setSelectedSubSubCategory("");
            setBrands([]);
            setfilterCategories([]);
            alert("Filter saved successfully");
        } else {   alert(
                "Error saving filter: " +
                data.message
            );
        };
    };
    return (
        <div className="p-6 max-w-xl">
            <h1 className="text-xl font-bold mb-4">
                Filter Admin
            </h1>

            {loading && <p>Loading...</p>}
            {error && (
                <p className="text-red-500">
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit} >
                {/* hidden fields */}
                <input
                    type="hidden"
                    name="category"
                    value={
                        selectedCategory
                    }
                />

                <input
                    type="hidden"
                    name="subCategory"
                    value={
                        selectedSubCategory
                    }
                />

                <input
                    type="hidden"
                    name="subSubCategory"
                    value={
                        selectedSubSubCategory
                    }
                />

                <input
                    type="hidden"
                    name="brands"
                    value={JSON.stringify(
                        brands
                    )}
                />

                {/* Category */}
                <select
                    className="border p-2 w-full mb-4"
                    value={
                        selectedCategory
                    }
                    onChange={(e) => {
                        setSelectedCategory(
                            e.target.value
                        );
                        setSelectedSubCategory(
                            ""
                        );
                        setSelectedSubSubCategory(
                            ""
                        );
                    }}
                >
                    <option value="">
                        Select Category
                    </option>

                    {categories.map(
                        (cat) => (
                            <option
                                key={
                                    cat._id
                                }
                                value={
                                    cat._id
                                }
                            >
                                {
                                    cat.mainCategory
                                }
                            </option>
                        )
                    )}
                </select>

                {/* SubCategory */}
                <select
                    className="border p-2 w-full mb-4"
                    value={
                        selectedSubCategory
                    }
                    onChange={(e) => {
                        setSelectedSubCategory(
                            e.target
                                .value
                        );
                        setSelectedSubSubCategory(
                            ""
                        );
                    }}
                    disabled={
                        !selectedCategory
                    }
                >
                    <option value="">
                        Select SubCategory
                    </option>

                    {subCategories.map(
                        (sub, i) => (
                            <option
                                key={i}
                                value={
                                    sub.name
                                }
                            >
                                {
                                    sub.name
                                }
                            </option>
                        )
                    )}
                </select>

                {/* SubSubCategory */}
                <select
                    className="border p-2 w-full mb-4"
                    value={
                        selectedSubSubCategory
                    }
                    onChange={(e) =>
                        setSelectedSubSubCategory(
                            e.target
                                .value
                        )
                    }
                    disabled={
                        !selectedSubCategory
                    }
                >
                    <option value="">
                        Select SubSubCategory
                    </option>

                    {subSubCategories.map(
                        (
                            item,
                            i
                        ) => (
                            <option
                                key={i}
                                value={
                                    item
                                }
                            >
                                {item}
                            </option>
                        )
                    )}
                </select>

                {/* Add Brand */}
                <div className="flex items-center gap-2.5 mb-4">
                    <input
                        type="text"
                        className="border p-2 w-full"
                        placeholder="Enter brand name"
                        value={
                            brandInput
                        }
                        onChange={(e) =>
                            setBrandInput(
                                e.target
                                    .value
                            )
                        }
                        onKeyDown={(
                            e
                        ) => {
                            if (
                                e.key ===
                                "Enter"
                            ) {
                                e.preventDefault();
                                addBrand();
                            }
                        }}
                    />

                    <button
                        type="button"
                        onClick={
                            addBrand
                        }
                        className="bg-gray-200 px-3 py-2"
                    >
                        + Add Brand
                    </button>
                </div>

                {/* Brand List */}
                <div className="mb-4 space-y-2">
                    {brands.map(
                        (
                            brand,
                            i
                        ) => (
                            <div
                                key={i}
                                className="flex justify-between items-center border px-3 py-2"
                            >
                                <span>
                                    {
                                        brand
                                    }
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeBrand(
                                            i
                                        )
                                    }
                                    className="text-red-500 text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        )
                    )}
                </div>
                {/* Add Category */}
                <div className="flex items-center gap-2.5 mb-4">
                    <input
                        type="text"
                        className="border p-2 w-full"
                        placeholder="Enter category name"
                        value={
                            categorysInput
                        }
                        onChange={(e) =>
                            setcategorysInput(
                                e.target
                                    .value
                            )
                        }
                        onKeyDown={(
                            e
                        ) => {
                            if (
                                e.key ===
                                "Enter"
                            ) {
                                e.preventDefault();
                                addCategory();
                            }
                        }}
                    />

                    <button
                        type="button"
                        onClick={
                            addCategory
                        }
                        className="bg-gray-200 px-3 py-2"
                    >
                        + Add Category
                    </button>
                </div>

                {/* Category List */}
                <div className="mb-4 space-y-2">
                    {filterCategories.map(
                        (
                            category,
                            i
                        ) => (
                            <div
                                key={i}
                                className="flex justify-between items-center border px-3 py-2"
                            >
                                <span>
                                    {
                                        category
                                    }
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeCategory(
                                            i
                                        )
                                    }
                                    className="text-red-500 text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        )
                    )}
                </div>

                <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 cursor-pointer"
                >
                    Save Filter
                </button>
            </form>
        </div>
    );
}