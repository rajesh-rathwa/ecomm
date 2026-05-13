import { model, models, Schema, Types } from "mongoose";

export type Filter = {
  category: Types.ObjectId;
  subCategory?: string | null;
  subSubCategory?: string | null;
  categories: string[];
  brands: string[];
};

const FilterSchema = new Schema<Filter>(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: "Categories",
      required: true,
    },

    subCategory: {
      type: String,
      trim: true,
      default: null,
    },

    subSubCategory: {
      type: String,
      trim: true,
      default: null,
    },

    brands: {
      type: [String],
      default: [],
    },

    categories: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

FilterSchema.index(
  { category: 1, subCategory: 1, subSubCategory: 1 },
  { unique: true }
);

export default models.Filter || model<Filter>("Filter", FilterSchema);