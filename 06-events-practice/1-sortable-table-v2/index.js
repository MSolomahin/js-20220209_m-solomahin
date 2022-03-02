export default class SortableTable {
  constructor(headerConfig, {
                data = [],
                sorted = {}
              } = {}
  ) {
    this.data = data
    this.headerConfig = headerConfig
    this.sorted = sorted

    this.isSortLocally = true
    this.render();
    this.initEventListeners()
  }

  element;
  subElements = {}

  getTemplate() {
    return `
    <div class="sortable-table">

      ${this.getHeader()}
      ${this.getBody()};

      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>
    </div>`
  }

  getHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getHeaderRow()}
      </div>`
  }

  getHeaderRow(){
    return `
        ${this.headerConfig.map((item) => {
          return `${this.getHeaderColumn(item)}`
    }).join("")}`
  }

  getHeaderColumn (item){
    return `
      <div class="sortable-table__cell" data-id=${item.id} data-sortable=${item.sortable}>
        <span>${item.title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>`
  }

  getBody() {
    return `
   <div data-element="body" class="sortable-table__body">
     ${this.getTableRows(this.data)}
   </div>`
  }

  getTableRows (data) {
    return data.map((item) => {
      return `
          <a href="/products/${item.id}" class="sortable-table__row">
            ${this.getTableRow(item)}
          </a>`
    }).join("")
  }

  getTableRow(item) {
    const cells = this.headerConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    });


    return cells.map(({id,template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`
    }).join("")
  }

  render() {
    const wrapper = document.createElement(`div`);
    wrapper.innerHTML = this.getTemplate();
    const element = wrapper.firstElementChild;
    this.element = element;

    this.subElements = this.getSubElements(element);

    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id = "${this.sorted.id}"]`);
    this.sort(this.sorted.id, this.sorted.order,[], currentColumn);

  }

  initEventListeners() {
    const btnHeaderSort = this.element.querySelector(".sortable-table__header");
    btnHeaderSort.addEventListener('pointerdown', this.handleClick);
  }

  handleClick = e => {
    const currentColumn = e.target.closest(".sortable-table__cell")
    if (currentColumn.dataset.sortable === 'true') {

      const target = e.target.closest("div");
      const setDirection = target.dataset.order === "desc" ? "asc" : "desc";
      const allColumn = e.target.closest(".sortable-table__header").children

      this.sort(target.dataset.id, setDirection, [...allColumn], currentColumn)
    }
  }

  sort (field, order, allColumn = [], currentColumn) {
    if (this.isSortLocally) {
      this.sortOnClient(field, order, allColumn = [], currentColumn);
    } else {
      this.sortOnServer();
    }
  }

  sortOnClient(field, order, allColumn = [], currentColumn) {
    const sortedData = this.sortData(field, order);
    const elem = this.element.querySelector(".sortable-table__body")

    allColumn.forEach(column => {
      column.dataset.order = "";
    })

    currentColumn.dataset.order = currentColumn.dataset.sortable === "true" ? order : "";
    this.subElements.body.innerHTML = this.getTableRows(sortedData)

    elem.replaceWith = this.subElements.body
  }

  sortData(field, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find(item => item.id === field)
    const { sortType } = column

    const direction = {
      asc: 1,
      desc: -1
    };

    const dem = direction[order];

    return arr.sort((a, b) => {
      switch (sortType) {
        case "string":
          return dem * a[field].localeCompare(b[field], 'ru-en-u-kf-upper');
        case "number":
          return dem * (a[field] - b[field]);
        default:
          return dem * (a[field] - b[field]);
      }
    })
  }

  sortOnServer (){

  }

  getSubElements(element) {

    const result = {};
    const elements = element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {}
  }

}

