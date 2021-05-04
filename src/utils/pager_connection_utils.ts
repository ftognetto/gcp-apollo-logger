
export const getConnection = (items: any[], limit: number) => {
    let hasNextPage = false;
    let endCursor = null;
    if (items.length === limit + 1) { 
        hasNextPage = true; 
        endCursor = items[items.length - 2]._id;
    }
    items = items.slice(0, limit);
    endCursor = items.length ? items[items.length - 1]._id : null;
    return {
        nodes: items,
        pageInfo: {
            endCursor,
            hasNextPage
        }
    };
};
