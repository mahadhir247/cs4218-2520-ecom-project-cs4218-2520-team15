import { Modal, Select } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import AdminMenu from "./../../components/AdminMenu";
import Layout from "./../../components/Layout";

const { Option } = Select;

const UpdateProduct = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState({
    id: "",
    name: "",
    description: "",
    photo: "",
    category: "",
    price: "",
    quantity: "",
    shipping: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [visible, setVisible] = useState(false);

  //get single product
  const getSingleProduct = async () => {
    try {
      const { data } = await axios.get(
        `/api/v1/product/get-product/${params.slug}`,
      );
      if (data?.success) {
        setProduct({
          id: data.product._id,
          name: data.product.name,
          description: data.product.description,
          photo: `/api/v1/product/product-photo/${data.product._id}`,
          category: data.product.category._id,
          price: data.product.price,
          quantity: data.product.quantity,
          shipping: data.product.shipping ? "1" : "0",
        });
        setIsFormValid(true);
      } else {
        setProduct({
          id: "",
          name: "",
          description: "",
          photo: "",
          category: "",
          price: "",
          quantity: "",
          shipping: "",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong in getting product");
    }
  };

  //get all category
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) {
        setCategories(data?.category);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong in getting category");
    }
  };

  useEffect(() => {
    getAllCategory();
    getSingleProduct();
    // eslint-disable-next-line
  }, []);

  const updateField = (field, value) => {
    if (field === "photo" && value?.size) {
      if (value.size > 1000000) {
        toast.error("Photo size cannot exceed 1MB");
        return;
      }
    }
    const updatedProduct = { ...product, [field]: value };
    setProduct(updatedProduct);
    const isValid = Object.values(updatedProduct).every((value) => !!value);
    setIsFormValid(isValid);
  };

  //create product function
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const productData = new FormData();
      productData.append("name", product.name);
      productData.append("description", product.description);
      productData.append("price", product.price);
      productData.append("quantity", product.quantity);
      if (product.photo instanceof File) {
        productData.append("photo", product.photo);
      }
      productData.append("category", product.category);
      productData.append("shipping", product.shipping);
      const { data } = await axios.put(
        `/api/v1/product/update-product/${product.id}`,
        productData,
      );
      if (data?.success) {
        toast.success("Product updated successfully");
        navigate("/dashboard/admin/products");
      } else {
        toast.error(data?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  //delete a product
  const handleDelete = async () => {
    try {
      const { data } = await axios.delete(
        `/api/v1/product/delete-product/${product.id}`,
      );
      if (data?.success) {
        toast.success("Product deleted successfully");
        setVisible(false);
        navigate("/dashboard/admin/products");
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Layout title={"Dashboard - Update Product"}>
      <div className="container-fluid p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h1>Update Product</h1>
            <div className="m-1 w-75">
              <Select
                variant="borderless"
                placeholder="Select a category"
                size="large"
                showSearch
                className="form-select mb-3"
                onChange={(value) => {
                  updateField("category", value);
                }}
                value={product.category}
              >
                {categories?.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
              <div className="mb-3">
                <label className="btn btn-outline-secondary col-md-12">
                  {product.photo?.name ? product.photo.name : "Upload Photo"}
                  <input
                    data-testid="img-upload"
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={(e) => updateField("photo", e.target.files[0])}
                    hidden
                  />
                </label>
              </div>
              <div className="mb-3">
                {product.photo && (
                  <div className="text-center">
                    <img
                      src={
                        product.photo instanceof File
                          ? URL.createObjectURL(product.photo)
                          : product.photo
                      }
                      alt="product_photo"
                      height={"200px"}
                      className="img img-responsive"
                    />
                  </div>
                )}
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={product.name}
                  placeholder="Enter a name"
                  className="form-control"
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>
              <div className="mb-3">
                <textarea
                  type="text"
                  value={product.description}
                  placeholder="Enter a description"
                  className="form-control"
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>

              <div className="mb-3">
                <input
                  type="number"
                  value={product.price}
                  placeholder="Enter a price"
                  className="form-control"
                  onChange={(e) => updateField("price", e.target.value)}
                />
              </div>
              <div className="mb-3">
                <input
                  type="number"
                  value={product.quantity}
                  placeholder="Enter a quantity"
                  className="form-control"
                  onChange={(e) => updateField("quantity", e.target.value)}
                />
              </div>
              <div className="mb-3">
                <Select
                  variant="borderless"
                  placeholder="Select shipping "
                  size="large"
                  showSearch
                  className="form-select mb-3"
                  onChange={(value) => {
                    updateField("shipping", value);
                  }}
                  value={product.shipping}
                >
                  <Option key={0} value="0">
                    No
                  </Option>
                  <Option key={1} value="1">
                    Yes
                  </Option>
                </Select>
              </div>
              <div className="mb-3">
                <button
                  className="btn btn-primary"
                  onClick={handleUpdate}
                  disabled={!isFormValid}
                >
                  Update
                </button>
              </div>
              <div className="mb-3">
                <button
                  className="btn btn-danger"
                  onClick={() => setVisible(true)}
                  disabled={Object.values(product).every(
                    (value) => value === "",
                  )}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        title="Are you sure you want to delete this product?"
        open={visible}
        okText="Confirm"
        okButtonProps={{ danger: true }}
        onOk={handleDelete}
        onCancel={() => setVisible(false)}
      />
    </Layout>
  );
};

export default UpdateProduct;
