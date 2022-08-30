import {
  spinerOn,
  spinerOff,
  getFromSS,
  saveToSS,
  notificationOk,
  notificationErorr,
} from '../js/utils.js';
import axios from 'axios';
import { pageMenu } from '../js/pagination';
import renderCard from '../templates/card-tpl.hbs';

const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events';
const API_KEY = 'unEzXyPGRdZtlW4MZOT74rfieLb91xjQ';
const form = document.querySelector('#form');
const eventsList = document.querySelector('.events');

let keyword = 'vs';
let countryCode = 'US';
let numberCardByPage = 16;
let totalPages = 100;
let startPage = 1;

form.addEventListener('submit', onSubmit);

export let key = {
  page: startPage,
  keyword,
  countryCode,
  numberCardByPage,
};

function onSubmit(event) {
  event.preventDefault();
  key.keyword = form.elements.searchQuery.value;
  key.countryCode = form.elements.chooseQuery.value;
  key.page = 1;
  fetchServer(key);
}
//обратиться к серверу
const fetchServer = ({ page, keyword, countryCode, numberCardByPage }) => {
  const params = {
    apikey: API_KEY,
    countrysCode: countryCode,
    keyword: keyword,
    size: numberCardByPage,
    page,
  };

  if (getFromSS(key) === null) {
    console.log('=====IF=====');
    try {
      console.log('=====IF====IF=====');
      return axios.get(`${BASE_URL}`, { params }).then(res => {
        if (res.data._embedded !== undefined) {
          console.log(res.data._embedded.events.length);
          saveToSS(key, res);
          setTotalPage(res.data.page.totalElements);
          renderElems(res.data);
          setPaginationServer(totalPages, key);
          console.log(res.data._embedded.events);
          return res.data;
        } else {
          notificationErorr();
        }
      });
    } catch {}
  } else {
    console.log('=====ELSE=====');
    let res = getFromSS(key);
    setTotalPage(res.data.page.totalElements);
    renderElems(res.data);
    setPaginationLS(totalPages, key);
    return Promise.resolve(res.data);
  }
};

function setPaginationServer(totalPages, key) {
  pageMenu(totalPages).on('beforeMove', async function (eventData) {
    spinerOn();
    let pages = eventData.page;
    key.page = pages;
    try {
      const data = await fetchServer(key);
      renderElems(data);
      spinerOff();
    } catch (err) {
      console.log(err);
      spinerOff();
      localStorage.clear();
    }
  });
}
function setPaginationLS(totalPages, key) {
  pageMenu(totalPages).on('beforeMove', async function (eventData) {
    let pages = eventData.page;
    key.page = pages;
    try {
      const data = await fetchServer(key);
      renderElems(data);
    } catch (err) {
      console.log(err);
      spinerOff();
      localStorage.clear();
    }
  });
}

function setTotalPage(number) {
  if (number < 960) {
    totalPages = number;
  } else {
    totalPages = 960;
  }
}

fetchServer(key);
// отрисовка карточек
export function renderElems(data) {
  let LSElements = data._embedded.events;
  eventsList.innerHTML = renderCard(LSElements);
}
