import { ICategory } from "../../../../../../../common/ICategory.interface";

export interface FlatCategory {
  id: string;
  name: string;
  level: number;
  path: string[];
}

export const flattenCategories = (
  categories: ICategory[],
  level = 1,
  parentPath: string[] = []
): FlatCategory[] => {
  let result: FlatCategory[] = [];

  for (const cat of categories) {
    const currentPath = [...parentPath, cat.categoryName];

    result.push({
      id: cat._id!,
      name: cat.categoryName,
      level,
      path: currentPath,
    });

    if (cat.children?.length) {
      result = result.concat(
        flattenCategories(cat.children, level + 1, currentPath)
      );
    }
  }

  return result;
};