import React from "react";
import { useParams } from "react-router-dom";
import AdditionalInfo from "./Product/AdditonInfo/AdditionalInfo";
import Product from "./Product/ProductMain/Product";
import RelatedProducts from "./Product/RelatedProducts/RelatedProducts";

const DetailsProduct = () => {
  const { id } = useParams(); // Get the product ID from the URL

  return (
    <>
      <Product
        selectedProductID={id}
        setSelectedProductID={() => {}} // No-op function as routing handles selection
      />
      <AdditionalInfo selectedProductID={id} />
      <RelatedProducts
        selectedProductID={id}
        setSelectedProductID={() => {}} // No-op function as routing handles selection
      />
    </>
  );
};

export default DetailsProduct;
