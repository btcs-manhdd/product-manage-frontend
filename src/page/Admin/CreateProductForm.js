import Select from "react-select";
import { useState } from "react";
import { storage } from "../../firebase.js";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import ProductApi from "../../api/ProductApi";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";
import ProductService from "../../services/ProductService";
import ValidateProductForm from "../../services/ValidateProductForm.js";
import { RiErrorWarningLine } from "react-icons/ri";

const CreateProductForm = ({ categories, colors, sizes }) => {
  const navigate = useNavigate();
  const [imgUrls, setImgUrls] = useState([]);
  const [product, setProduct] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChangeImg = async (e) => {
    try {
      const file = e.target.files[0];
      const imageRef = ref(storage, `image/${file.name}`);
      const uploadTask = uploadBytesResumable(imageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (err) => console.log(err),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            setImgUrls((prev) => [...prev, url]);
            setProduct((prev) => ({
              ...prev,
              img_urls: prev.img_urls ? [...prev.img_urls, url] : [url],
            }));
          });
        }
      );
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const handleCreateproduct = async () => {
    try {
      setIsLoading(true);
      const checkValidate = ValidateProductForm.validateProduct(product);
      if (checkValidate) {
        const newProduct = await ProductApi.createProduct(product);
        setIsLoading(false);
        navigate("/admin");
      } else {
        alert("Please fill all fields");
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };
  return (
    <div className="mt-12 px-44 w-full flex relative">
      <div className="w-1/2 pr-20">
        <div className="flex flex-col mb-4">
          <label className="text-xl font-medium mb-2 flex items-center">
            Product name
            <RiErrorWarningLine className="ml-2" />
          </label>
          <input
            required
            placeholder="Enter product name"
            className="px-2 py-2 rounded-md border-2 border-gray-300 focus:outline-none focus:border-2 focus:border-blue-500"
            onChange={(e) =>
              setProduct({ ...product, product_name: e.target.value })
            }
          />
          <span className="mt-2 text-sm text-yellow-300">
            Do not execeed 50 characters when entering the product name
          </span>
        </div>

        <div className="flex flex-col  mb-4">
          <label className=" text-xl font-medium mb-2 flex items-center">
            Category <RiErrorWarningLine className="ml-2" />
          </label>
          <Select
            options={ProductService.convertCategoriesToSelectElementData(
              categories
            )}
            onChange={(e) => setProduct({ ...product, category_id: e.value })}
          />
        </div>

        <div className="flex flex-col  mb-4">
          <label className="text-xl font-medium mb-2 flex items-center">
            Add color <RiErrorWarningLine className="ml-2" />
          </label>
          <Select
            options={ProductService.convertColorsToSelectElementData(colors)}
            isMulti
            onChange={(e) => {
              const colorIds = e.map((color) => color.value);
              setProduct({ ...product, color_id: colorIds });
            }}
            styles={{
              multiValueLabel: (styles, { data }) => {
                return {
                  ...styles,
                  backgroundColor: data.label,
                };
              },
              option: (styles, { data }) => {
                return {
                  ...styles,
                  ":hover": {
                    backgroundColor: data.label,
                  },
                };
              },
            }}
          />
        </div>

        <div className="flex flex-col ">
          <label className="text-xl font-medium mb-2">Description</label>
          <textarea
            placeholder="Enter description"
            className="px-2 py-2 rounded-md border-2 border-gray-300 focus:outline-none focus:border-2 focus:border-blue-500 min-h-[160px]"
            onChange={(e) => {
              setProduct({ ...product, product_description: e.target.value });
            }}
          />
          <span className="mt-2 text-sm text-yellow-300">
            Do not execeed 100 characters when entering the product description
          </span>
        </div>
      </div>

      <div className="relative w-1/2">
        <div className="mb-20 w-full">
          <label className="text-xl font-medium mb-2 flex items-center">
            Product image <RiErrorWarningLine className="ml-2" />
          </label>
          <div className="flex items-center">
            <div className="max-w-[200px] rounded-lg shadow-xl bg-gray-50 pb-2">
              <div className="m-4">
                <label className="inline-block mb-2 text-gray-500">
                  File Upload
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col w-full h-32 border-4 border-blue-200 border-dashed hover:bg-gray-100 hover:border-gray-300">
                    <div className="flex flex-col items-center justify-center pt-7">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8 text-gray-400 group-hover:text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                        Upload a file
                      </p>
                    </div>
                    <input
                      type="file"
                      className="opacity-0"
                      onChange={handleChangeImg}
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="flex ml-4 overflow-x-hidden flex-wrap">
              {imgUrls.map((url) => (
                <div className="h-24 w-28 mr-2 mb-1 relative" key={url}>
                  <img className="w-full h-full" src={url} alt="product" />
                  <span
                    className="absolute -top-2 right-0 p-1 cursor-pointer"
                    onClick={() => {
                      setImgUrls((prev) => prev.filter((item) => item !== url));
                      setProduct((prev) => ({
                        ...prev,
                        img_urls: prev.img_urls.filter((item) => item !== url),
                      }));
                    }}
                  >
                    x
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-xl font-medium mb-2 flex items-center">
            Add size <RiErrorWarningLine className="ml-2" />
          </label>
          <Select
            options={ProductService.convertSizesToSelectElementData(sizes)}
            isMulti
            onChange={(e) => {
              const sizeIds = e.map((size) => size.value);
              setProduct({ ...product, size_id: sizeIds });
            }}
          />
        </div>

        <div className="absolute bottom-0">
          <button
            className=" px-4 py-2 bg-blue-900 text-white rounded-md font-medium hover:bg-blue-600 mr-4"
            onClick={handleCreateproduct}
          >
            Add Product
          </button>
          <button
            className=" px-4 py-2 text-white rounded-md font-medium bg-gray-500 hover:bg-gray-700"
            onClick={() => {
              navigate("/admin");
            }}
          >
            Cancel
          </button>
        </div>
      </div>
      {isLoading && (
        <div className="w-screen h-screen top-0 fixed left-0 bg-black opacity-70 flex flex-col justify-center items-center">
          <Loading />
          <span className="text-xl text-white">Creating...</span>
        </div>
      )}
    </div>
  );
};

export default CreateProductForm;
