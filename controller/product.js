const Product = require("../models/product");
const User = require("../models/user");
const shortid = require("shortid");
const slugify = require("slugify");
const Category = require("../models/category");
const mongoose = require("mongoose");
const ObjectID = require("mongoose").Types.ObjectId;
exports.createProduct = (req, res) => {
  //res.status(200).json( { file: req.files, body: req.body } );

  const {
    name,
    url,
    description,
    publicationPrice,
    category,
    devise,
    typeSite,
    visitorsPerMonth,
    createdBy,
  } = req.body;
  let productPictures = [];

  if (req.files.length > 0) {
    productPictures = req.files.map((file) => {
      return { img: "/public/" + file.filename };
    });
  }

  const product = new Product({
    name: name,
    slug: slugify(name),
    url,
    description,
    publicationPrice,
    devise,
    typeSite,
    productPictures,
    visitorsPerMonth,
    category,
    createdBy: req.user._id,
  });

  product.save((error, product) => {
    if (error) return res.status(400).json({ error });
    if (product) {
      res.status(201).json({ product, files: req.files });
    }
  });
};

exports.getProductsBySlug = (req, res) => {
  const { slug } = req.params;
  Category.findOne({ slug: slug })
    .select("_id")
    .exec((error, category) => {
      if (error) {
        return res.status(400).json({ error });
      }
      if (category) {
        Product.find({ category: category._id, isActive: true }).exec(
          (error, products) => {
            if (error) {
              return res.status(400).json({ error });
            }
            if (products) {
              res.status(200).json({ products });
            }
          }
        );
      }
    });
};
exports.getProductsByFilter = (req, res) => {
  if (req.body.slug == "All") {
    Product.find({ isActive: true })
      .populate({ path: "category", select: "_id name" })
      .exec((error, products) => {
        if (error) {
          return res.status(400).json({ error });
        }
        if (products) {
          const ItemsAll = products.filter(
            (item) =>
              item.publicationPrice >= req.body.minPrice &&
              item.publicationPrice <= req.body.maxPrice &&
              item.visitorsPerMonth <= req.body.maxVisitors &&
              item.visitorsPerMonth >= req.body.minVisitors
          );

          products = ItemsAll;
          res.status(200).json({ products });
        }
      });
  }
  Category.findOne({ name: req.body.slug })
    .select("_id")
    .exec((error, category) => {
      if (error) {
        return res.status(400).json({ error });
      }
      if (category) {
        Product.find({ isActive: true, category: category._id })
          .populate({ path: "category", select: "_id name" })
          .exec((error, products) => {
            const Items = products.filter(
              (item) =>
                item.publicationPrice >= req.body.minPrice &&
                item.publicationPrice <= req.body.maxPrice &&
                item.visitorsPerMonth <= req.body.maxVisitors &&
                item.visitorsPerMonth >= req.body.minVisitors
            );

            products = Items;

            if (error) {
              return res.status(400).json({ error });
            }
            if (products) {
              res.status(200).json({ products });
            }
          });
      }
    });
};

exports.getProductDetailsById = (req, res) => {
  const { productId } = req.params;

  if (productId) {
    Product.findOne({ _id: productId })
      .populate({ path: "category", select: "_id name" })
      .populate({ path: "user", select: "_id username " })
      .exec((error, product) => {
        if (error) return res.status(400).json({ error });
        if (product) {
          User.findOne({ _id: product.createdBy }).exec((err, user) => {
            res.status(200).json({ product, user });
          });
        }
      });
  } else {
    return res.status(400).json({ error: "Params required" });
  }
};
exports.getProductsByUser = async (req, res) => {
  const { uid } = req.params;

  if (uid) {
    if (!mongoose.Types.ObjectId.isValid(uid))
      return res.status(200).json({ products: [] });
    const products = await Product.find({ createdBy: req.params.uid })
      .select(
        "_id name slug quantity slug  publicationPrice  typeSite description productPictures category devise visitorsPerMonth createdAt isActive url"
      )
      .populate({ path: "category", select: "_id name" })
      .populate({ path: "user", select: "_id username " })
      .exec();

    res.status(200).json({ products });
  }
};
// new update
exports.deleteProductById = (req, res) => {
  const { productId } = req.body.payload;

  if (productId) {
    Product.deleteOne({ _id: productId }).exec((error, result) => {
      if (error) return res.status(400).json({ error });
      if (result) {
        res.status(202).json({ result });
      }
    });
  } else {
    res.status(400).json({ error: "Params required" });
  }
};
exports.deleteProductByIdPramas = (req, res) => {
  const { productId } = req.params;
  if (productId) {
    Product.deleteOne({ _id: productId })
      .populate({ path: "user", select: "_id username " })
      .exec((error, result) => {
        if (error) return res.status(400).json({ error });
        if (result) {
          res.status(202).json({ result });
        }
      });
  } else {
    res.status(400).json({ error: "Params required" });
  }
};
exports.getProducts = async (req, res) => {
  const products = await Product.find({ createdBy: req.user._id })
    .select("_id name price quantity slug description productPictures category")
    .populate({ path: "category", select: "_id name" })
    .exec();

  res.status(200).json({ products });
};
exports.activatewebsite = (req, res) => {
  if (req.params) {
    Product.findOne({
      _id: req.params.siteid,
    }).then((website) => {
      if (!website) {
        res.status(400).send({
          message: "website code false",
        });
      }
      website.isActive = true;
      website.save();
      res.status(200).json({
        message: "website activation successful",
      });
    });
  }
};

module.exports.updateProduct = async (req, res) => {
  console.log(req.body.categoryId);
  if (!ObjectID.isValid(req.body.uid))
    return res.status(400).send("ID unknown : " + req.params.id);
  try {
    await Product.findOneAndUpdate(
      { _id: req.body.id, createdBy: req.body.uid },
      {
        $set: {
          name: req.body.name,
          category: req.body.categoryId,
          publicationPrice: req.body.publicationPrice,
          description: req.body.description,
          devise: req.body.devise,
          typeSite: req.body.typeSite,
          url: req.body.url,
          visitorsPerMonth: req.body.visitorsPerMonth,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
      (err, docs) => {
        if (!err) return res.send(docs);
        if (err) return res.status(500).send({ message: err });
      }
    );
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports.updateProductId = async (req, res) => {
  try {
    await Product.findOneAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          description: req.body.descriptionValueOne,
          category: req.body.categoryId,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
      (err, docs) => {
        if (!err) return res.send(docs);
        if (err) return res.status(500).send({ message: err });
      }
    );
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};
