class ApiFetures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    // removing some fields for category
    const removeField = ["keyword", "page", "limit"];
    removeField.forEach((key) => delete queryCopy[key]);

    // Add discount filter
    // if (queryCopy.discount) {
    //     const discountPercentage = parseInt(queryCopy.discount); // Convert the discount to an integer
    //     const discountValue = (discountPercentage / 100); // Convert percentage to a decimal value
    
    //     // Filter for products with a discount greater than or equal to the specified percentage
    //     queryCopy.discount = { $gte: discountValue };
    // }
    // console.log(queryCopy)
    // Filter price and ratings
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort({ creditAt: 1 }); // Default sorting by 'creditAt' in ascending order
    }
    return this;
  }
  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPage * (currentPage - 1);
    // this.query = this.query.limit(resultPerPage).skip(skip);
    this.query = this.query.limit(resultPerPage).skip(skip).sort({ _id: -1 });
    return this;
  }
}

module.exports = ApiFetures;
