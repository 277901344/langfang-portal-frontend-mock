/**
 * Global UI tokens for the trading frontend.
 * Keep shared spacing, block styles, background colors, and paging defaults here
 * so backend pages stay visually consistent.
 */
export const UI_CONFIG = {
    layout: {
        pagePaddingLeft: 'pl-5', // 20px left gutter between menu and content
        pagePaddingRight: 'pr-7', // 28px right gutter aligned with top logo/header edge
        pagePaddingInline: 'pl-5 pr-7',
        pagePaddingInline50px: 'px-12', // 24px horizontal page padding
        pagePaddingY: 'py-6', // 24px vertical page padding
        pagePading: 'p-6',
        narrowMaxWidth: 'max-w-6xl', // 1280px
        outerPageGapNum: 50,
        outerPageGapNum40:40,
        adminSiderContentWidthNum: 208,
        desktopMinWidth: 'min-w-[1200px]',
        desktopMinWidthNum: 1200,
    },

    block: {
        base: 'bg-white rounded-xl',
        searchAreaPadding: 'p-5', // 20px
        searchAreaShadow: 'shadow-sm',
        contentAreaPadding: 'p-5', // 20px
        contentAreaPaddingNum: 20,
    },

    spacing: {
        searchToContent: 'mb-5', // 20px
        cardGap: 12,
        formToSaveBtn: 'mt-5', // 20px
        formSectionMbGap: 'mb-5',
        buttonGap: 'gap-2', // 8px
        buttonGapNum: 8,
        tableToPaginationNum: 20,
        blockInnerGap: 'gap-5',
        blockInnerGapNum: 20,
    },

    pagination: {
        tablePageSize: 10,
        gridPageSize: 12,
    },

    modal: {
        width: 720,
        maskClosable: false,
    },

    pageBackground: 'bg-[#f7f9fc]',

    input: {
        inputWidth: 200,
        baseInputHeight: 32,
        bannerSearchHeight: 40,
        selectWidth: 200,
        maxLength: 50,
        textAreaMaxLength: 200,
    },
};
