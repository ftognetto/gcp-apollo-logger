import { snakeCase } from 'lodash';

export const camelCaseFieldResolver = (root: any, params: any, ctx: any, info: any) => {
    if (!info.fieldName.startsWith('id_')) { 
      const snake = snakeCase(info.fieldName);
      if (!root[info.fieldName] && root[snake]) {
        return root[snake]; 
      }      
    }
    return root[info.fieldName];
};
