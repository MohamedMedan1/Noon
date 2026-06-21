export class PrismaQueryFeatures {
  public prismaArgs: Record<string, any> = {};
  private queryString: Record<string, any>;

  constructor(queryString: Record<string, any>) {
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    
    this.prismaArgs.where = JSON.parse(queryStr);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortFields = this.queryString.sort.split(',');
      
      this.prismaArgs.orderBy = sortFields.map((field: string) => {
        if (field.startsWith('-')) {
          return { [field.substring(1)]: 'desc' };
        }
        return { [field]: 'asc' }; 
      });
    } else {
      this.prismaArgs.orderBy = { createdAt: 'desc' };
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',');
      const selectObj: Record<string, boolean> = {};
      
      fields.forEach((field: string) => {
        selectObj[field] = true;
      });

      this.prismaArgs.select = selectObj;
    }
    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 10;
    const skip = (page - 1) * limit;

    this.prismaArgs.take = limit;
    this.prismaArgs.skip = skip;

    return this;
  }

  async execute(prismaModel: any) {
    return await prismaModel.findMany(this.prismaArgs);
  }
}