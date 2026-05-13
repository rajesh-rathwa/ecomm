import { Schema, models, model } from "mongoose";

export type Categories = {
    mainCategory: string;
    subCategories: {
        name: string;
        subSubCategories: string[];
    }[];
};

const CategoriesSchema = new Schema<Categories>({
    mainCategory: {
        type: String,
        required: true,
    },
    subCategories: [
        {
            name: { type: String, required: true },
            subSubCategories: [{ type: String }],
        },
    ],
});

const CategoriesModel =
    models.Categories || model<Categories>("Categories", CategoriesSchema);

export default CategoriesModel;
