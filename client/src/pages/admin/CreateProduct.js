import { Select } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AdminMenu from "./../../components/AdminMenu";
import Layout from "./../../components/Layout";

const { Option } = Select;

const CreateProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formValue, setFormValue] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    quantity: "",
    shipping: "",
    photo: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);

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
  }, []);

  const updateField = (field, value) => {
    if (field == "photo" && value?.size) {
      if (value.size > 1000000) {
        toast.error("Photo size cannot exceed 1MB");
        return;
      }
    }
    const updatedFormValue = { ...formValue, [field]: value };
    setFormValue(updatedFormValue);
    const isValid = Object.values(updatedFormValue).every((value) => !!value);
    setIsFormValid(isValid);
  };

  //create product function
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const productData = new FormData();
      productData.append("name", formValue.name);
      productData.append("description", formValue.description);
      productData.append("price", formValue.price);
      productData.append("quantity", formValue.quantity);
      productData.append("photo", formValue.photo);
      productData.append("category", formValue.category);
      const { data } = await axios.post(
        "/api/v1/product/create-product",
        productData,
      );
      if (data?.success) {
        toast.success("Product created successfully");
        navigate("/dashboard/admin/products");
      } else {
        toast.error(data?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Layout title={"Dashboard - Create Product"}>
      <div className="container-fluid p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h1>Create Product</h1>
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
              >
                {categories?.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
              <div className="mb-3">
                <label className="btn btn-outline-secondary col-md-12">
                  {formValue.photo ? formValue.photo.name : "Upload Photo"}
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={(e) => updateField("photo", e.target.files[0])}
                    hidden
                  />
                </label>
              </div>
              <div className="mb-3">
                {formValue.photo && (
                  <div className="text-center">
                    <img
                      src={URL.createObjectURL(formValue.photo)}
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
                  value={formValue.name}
                  placeholder="Enter a name"
                  className="form-control"
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>
              <div className="mb-3">
                <textarea
                  type="text"
                  value={formValue.description}
                  placeholder="Enter a description"
                  className="form-control"
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>
              <div className="mb-3">
                <input
                  type="number"
                  value={formValue.price}
                  placeholder="Enter a price"
                  className="form-control"
                  onChange={(e) => updateField("price", e.target.value)}
                />
              </div>
              <div className="mb-3">
                <input
                  type="number"
                  value={formValue.quantity}
                  placeholder="Enter a quantity"
                  className="form-control"
                  onChange={(e) => updateField("quantity", e.target.value)}
                />
              </div>
              <div className="mb-3">
                <Select
                  variant="borderless"
                  placeholder="Select shipping"
                  size="large"
                  showSearch
                  className="form-select mb-3"
                  onChange={(value) => {
                    updateField("shipping", value);
                  }}
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
                  onClick={handleCreate}
                  disabled={!isFormValid}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProduct;
