import { Component, h, State, Element, Prop, Watch } from '@stencil/core';
import { AV_API_KEY } from '../../global/global';
@Component({
  tag: 'app-stock-price',
  styleUrl: './stock-proce.css',
  shadow: true,
})
export class StockPrice {
  stockInput: HTMLInputElement;
  // initialStockSymbol: string;
  @Element() el: HTMLElement;
  @State() fetchedPrice: number;
  @State() stockUserInput: string;
  @State() stockInputValid = false;
  @State() error: string;

  @Prop({ mutable: true, reflect: true }) stockSymbol: string;

  @Watch('stockSymbol')
  stockSymbolChanged(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.stockUserInput = newValue;
      this.fetchStockPrice(newValue);
    }
  }

  onUserInput(event: Event) {
    this.stockUserInput = (event.target as HTMLInputElement).value;
    if (this.stockUserInput.trim().length > 0) {
      this.stockInputValid = true;
    } else {
      this.stockInputValid = false;
    }
  }
  onFetchStockPrice(event: Event) {
    event.preventDefault();
    // const stockSymbol = (this.el.shadowRoot.querySelector('#stock-symbol') as HTMLInputElement).value;
    this.stockSymbol = this.stockInput.value;
    //this.fetchStockPrice(stockSymbol);
  }

  componentWillLoad() {
    console.log('Component Will load');
    console.log(this.stockSymbol);
  }

  componentDidLoad() {
    if (this.stockSymbol) {
      // this.initialStockSymbol = this.stockSymbol;
      this.stockUserInput = this.stockSymbol;
      this.stockInputValid = true;
      this.fetchStockPrice(this.stockSymbol);
    }
  }

  componentWillUpdate() {
    console.log('Component Will update');
    // if (this.stockSymbol !== this.initialStockSymbol) {
    //   this.initialStockSymbol = this.stockSymbol;
    //   this.fetchStockPrice(this.stockSymbol);
    // }
  }

  componentDidUpdate() {
    console.log('component did update');
    // if (this.stockSymbol !== this.initialStockSymbol) {
    //   this.initialStockSymbol = this.stockSymbol;
    //   this.fetchStockPrice(this.stockSymbol);
    // }
  }

  disconnectedCallback() {}

  fetchStockPrice(stockSymbol: string) {
    fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${AV_API_KEY}`)
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Invalid!');
        }
        this.error = null;
        return res.json();
      })
      .then(parseResp => {
        console.log(parseResp);
        if (!parseResp['Global Quote']['02. open']) {
          throw new Error('Invalid symbol');
        }
        this.fetchedPrice = +parseResp['Global Quote']['02. open'];
      })
      .catch(err => {
        console.log(err);
        this.error = err.message;
      });
  }

  render() {
    let dataContent = <p>Please enter a symbol</p>;
    if (this.error) {
      dataContent = <p>{this.error}</p>;
    }
    if (this.fetchedPrice) {
      dataContent = <p>Price:{this.fetchedPrice}</p>;
    }
    return [
      <form onSubmit={this.onFetchStockPrice.bind(this)}>
        <input id="stock-symbol" ref={el => (this.stockInput = el)} value={this.stockUserInput} onInput={this.onUserInput.bind(this)} />
        <button type="submit" disabled={!this.stockInputValid}>
          Fetch
        </button>
      </form>,
      <div>{dataContent}</div>,
    ];
  }
}
