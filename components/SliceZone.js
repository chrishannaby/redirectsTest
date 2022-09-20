import React from "react";
import {
  HeroSlice,
  PartnerSlice,
  FeatureBoxesSlice,
  RightImageSlice,
  LeftImageSlice,
  SliderSlice,
  // TitleImageSlice,
} from "./slices";

const SliceZone = ({ slices }) => {
  const sliceComponents = {
    index_section_one: HeroSlice,
    index_partner: PartnerSlice,
    index_section_two: FeatureBoxesSlice,
    index_section_four: RightImageSlice,
    index_section_three: LeftImageSlice,
    index_section_five: SliderSlice,
    // index_section_six: TitleImageSlice,
  };

  // return(
  //   <>
  //   {
  //     slices.map((slice, index) =>
  //       (
  //         <>
  //         <pre style={{maxWidth: '1000px'}}>{JSON.stringify(slice.slice_type, null, 2)}</pre>
  //         <hr />
  //         </>
  //       ))
  //   }
  //   </>
  // )

  return slices.map((slice, index) => {
    const SliceComponent = sliceComponents[slice.slice_type];
    if (SliceComponent) {
      return <SliceComponent slice={slice} key={`slice-${index}`} />;
    }
    return null;
  });
};

export default SliceZone;
