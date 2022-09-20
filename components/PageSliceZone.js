import {
  HeroSlice,
  HeroSliceMicroSite,
  FeatureBoxesSlice,
  LeftImageSlice,
  RightImageSlice,
  HtmlSlice,
  TitleImageSlice,
  PartnerSlice,
  SectionBgSlice,
  TwoSectionsMapsSlice,
  PartnersLogoSlice,
  VerifyEmailSlice,
  TestSlice,
  NotFoundSlice,
  FormCPPASlice,
  SitemapSlice,
} from "./slices";

const PageSliceZone = ({ slices = [] }) => {
  // console.log('---slices---', slices);
  const sliceComponents = {
    hero: HeroSlice,
    feature_boxes: FeatureBoxesSlice,
    left_image_section: LeftImageSlice,
    right_image_section: RightImageSlice,
    // connections_image: TitleImageSlice,
    partner_slice: PartnerSlice,
    // title_image: TitleImageSlice,
    index_partner: PartnerSlice,
    // partners: PartnersLogoSlice,
    html: HtmlSlice,
    micro_slice_one: HeroSliceMicroSite,
    micro_slice_two: SectionBgSlice,
    micro_slice_tree: TwoSectionsMapsSlice,
    micro_slice_four: FeatureBoxesSlice,
    // slice_validate_email: VerifyEmailSlice,
    // test: TestSlice,
    // page_not_found: NotFoundSlice,
    form_ccpa: FormCPPASlice,
    sitemap: SitemapSlice,
  };
  return slices.map((slice, index) => {
    const SliceComponent = sliceComponents[slice.slice_type];
    if (SliceComponent) {
      return (
        <SliceComponent
          slice={slice}
          key={`slice-${index}`}
          isVisibleImageMobile={false}
        />
      );
    }
    return null;
  });
};

export default PageSliceZone;
