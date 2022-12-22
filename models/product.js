const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    url: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: false,
    },
    publicationPrice: {
      type: Number,
      required: true,
      trim: true,
    },
    devise: {
      type: String,
      enum: ["Usd", "Euro", "Tnd"],
      required: true,
    },
    typeSite: {
      type: String,
      enum: ["site", "blog", "Magazine"],
      required: true,
    },
    productPictures: [{ img: { type: String } }],
    visitorsPerMonth: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("website", productSchema);
