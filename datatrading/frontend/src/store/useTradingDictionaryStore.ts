import { create } from 'zustand';

type DictionaryOption = {
    label: string;
    value: string;
};

interface TradingDictionaryState {
    dictionaryRevision: number;
    topicCategoryOptions: DictionaryOption[];
    applicationCategoryOptions: DictionaryOption[];
    updateFrequencyOptions: DictionaryOption[];
    topicCategoryMap: Record<string, string>;
    applicationCategoryMap: Record<string, string>;
    industryCategoryMap: Record<string, string>;
    organizationCategoryMap: Record<string, string>;
    dataAcquisitionMap: Record<string, string>;
    updateFrequencyMap: Record<string, string>;
    qualityLevelMap: Record<string, string>;
    securityLevelMap: Record<string, string>;
    setCategoryDictionaries: (payload: {
        topicCategories?: DictionaryOption[];
        applicationCategories?: DictionaryOption[];
        industryCategories?: DictionaryOption[];
        organizationCategories?: DictionaryOption[];
        dataAcquisitions?: DictionaryOption[];
        updateFrequencies?: DictionaryOption[];
        qualityLevels?: DictionaryOption[];
        securityLevels?: DictionaryOption[];
    }) => void;
    reset: () => void;
}

export const useTradingDictionaryStore = create<TradingDictionaryState>()((set) => ({
    dictionaryRevision: 0,
    topicCategoryOptions: [],
    applicationCategoryOptions: [],
    updateFrequencyOptions: [],
    topicCategoryMap: {},
    applicationCategoryMap: {},
    industryCategoryMap: {},
    organizationCategoryMap: {},
    dataAcquisitionMap: {},
    updateFrequencyMap: {},
    qualityLevelMap: {},
    securityLevelMap: {},
    setCategoryDictionaries: ({
        topicCategories,
        applicationCategories,
        industryCategories,
        organizationCategories,
        dataAcquisitions,
        updateFrequencies,
        qualityLevels,
        securityLevels,
    }) =>
        set((state) => ({
            dictionaryRevision: state.dictionaryRevision + 1,
            topicCategoryOptions: toDictionaryOptions(topicCategories),
            applicationCategoryOptions: toDictionaryOptions(applicationCategories),
            updateFrequencyOptions: toDictionaryOptions(updateFrequencies),
            topicCategoryMap: toDictionaryMap(topicCategories),
            applicationCategoryMap: toDictionaryMap(applicationCategories),
            industryCategoryMap: toDictionaryMap(industryCategories),
            organizationCategoryMap: toDictionaryMap(organizationCategories),
            dataAcquisitionMap: toDictionaryMap(dataAcquisitions),
            updateFrequencyMap: toDictionaryMap(updateFrequencies),
            qualityLevelMap: toDictionaryMap(qualityLevels),
            securityLevelMap: toDictionaryMap(securityLevels),
        })),
    reset: () =>
        set((state) => ({
            dictionaryRevision: state.dictionaryRevision + 1,
            topicCategoryOptions: [],
            applicationCategoryOptions: [],
            updateFrequencyOptions: [],
            topicCategoryMap: {},
            applicationCategoryMap: {},
            industryCategoryMap: {},
            organizationCategoryMap: {},
            dataAcquisitionMap: {},
            updateFrequencyMap: {},
            qualityLevelMap: {},
            securityLevelMap: {},
        })),
}));

function toDictionaryOptions(options?: DictionaryOption[]): DictionaryOption[] {
    if (!options || options.length === 0) {
        return [];
    }

    return options
        .filter((option) => option?.value && option?.label)
        .map((option) => ({
            label: option.label,
            value: option.value,
        }));
}

function toDictionaryMap(options?: DictionaryOption[]): Record<string, string> {
    if (!options || options.length === 0) {
        return {};
    }

    return options.reduce<Record<string, string>>((acc, option) => {
        if (!option?.value || !option?.label) {
            return acc;
        }
        acc[option.value] = option.label;
        return acc;
    }, {});
}
