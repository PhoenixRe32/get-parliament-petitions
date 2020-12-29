const fs = require('fs');
const axios = require('axios');


const getFirstPageOfPetitions = async () => {
  const response = await axios({
    method: 'get',
    url: 'https://petition.parliament.uk/petitions.json'
  });
  return response.data;
}

const getPetitions = async (page) => {
  const response = await axios({
    method: 'get',
    url: 'https://petition.parliament.uk/petitions.json',
    params: {
      page
    }
  })
  console.log(response.data.links.self);
  return response.data;
}

const getFirstPageOfArPetitions = async () => {
  const response = await axios({
    method: 'get',
    url: 'https://petition.parliament.uk/archived/petitions.json',
    params: {
      state: 'published'
    }
  });
  console.log(response.data.links.self);
  return response.data;
}

const getArPetitions = async (page) => {
  const response = await axios({
    method: 'get',
    url: 'https://petition.parliament.uk/archived/petitions.json',
    params: {
      state: 'published',
      page
    }
  })
  console.log(response.data.links.self);
  return response.data;
}

const getActivePetitions = async () => {
  console.log('Get active petitions');
  const firstPage = await getFirstPageOfPetitions();
  const lastPageUrl = firstPage.links.last;
  const lastPage = Number(lastPageUrl.match(/page=[0-9]+/)[0].substr(5));

  const petitions = [];
  firstPage.data.forEach((petition) => petitions.push({
      link: `https://petition.parliament.uk/petitions/${petition.id}`,
      action: petition.attributes.action,
      background: petition.attributes.background,
      state: petition.attributes.state,
      additional_details: petition.attributes.additional_details,
      signature_count: petition.attributes.signature_count,
      rejection: petition.attributes.rejection,
      government_response: petition.attributes.government_response,
    }))
  let i = 2;
  while (i <= lastPage) {
    const promises = [];
    const remainingPages = lastPage - i;
    if (remainingPages >= 50) {
      let j = 0
      while (j < 50) {
        promises.push(getPetitions(i++));
        j++;
      }
    } else {
      while (i <= lastPage) {
        promises.push(getPetitions(i++));
      }
    }

    const results = await Promise.all(promises);
    results.forEach((petitionsPage) => petitionsPage.data.forEach((petition) => petitions.push({
      link: `https://petition.parliament.uk/petitions/${petition.id}`,
      action: petition.attributes.action,
      background: petition.attributes.background,
      state: petition.attributes.state,
      additional_details: petition.attributes.additional_details,
      signature_count: petition.attributes.signature_count,
      rejection: petition.attributes.rejection,
      government_response: petition.attributes.government_response,
    })));
  }

  return petitions;
}

const getArchivedPetitions = async () => {
  console.log('Get archived petitions');
  const firstPage = await getFirstPageOfArPetitions();
  const lastPageUrl = firstPage.links.last;
  const lastPage = Number(lastPageUrl.match(/page=[0-9]+/)[0].substr(5));

  const petitions = [];
  firstPage.data.forEach((petition) => petitions.push({
      link: `https://petition.parliament.uk/petitions/${petition.id}`,
      action: petition.attributes.action,
      background: petition.attributes.background,
      state: petition.attributes.state,
      additional_details: petition.attributes.additional_details,
      signature_count: petition.attributes.signature_count,
      rejection: petition.attributes.rejection,
      government_response: petition.attributes.government_response,
    }))
  let i = 2;
  while (i <= lastPage) {
    const promises = [];
    const remainingPages = lastPage - i;
    if (remainingPages >= 50) {
      let j = 0
      while (j < 50) {
        promises.push(getArPetitions(i++));
        j++;
      }
    } else {
      while (i <= lastPage) {
        promises.push(getArPetitions(i++));
      }
    }

    const results = await Promise.all(promises);
    results.forEach((petitionsPage) => petitionsPage.data.forEach((petition) => petitions.push({
      link: `https://petition.parliament.uk/petitions/${petition.id}`,
      action: petition.attributes.action,
      background: petition.attributes.background,
      state: petition.attributes.state,
      additional_details: petition.attributes.additional_details,
      signature_count: petition.attributes.signature_count,
      rejection: petition.attributes.rejection,
      government_response: petition.attributes.government_response,
    })));
  }

  return petitions;
}

const start = async () => {
  const petitionsRejected = [];
  const petitionsAccepted = [];
  {
    const petitions = await getActivePetitions();
    petitions.forEach((petition) => {
      if (petition.state === 'rejected') {
        petitionsRejected.push(petition);
      } else {
        petitionsAccepted.push(petition);
      }
    });
  }
  {
    const petitions = await getArchivedPetitions();
    petitions.forEach((petition) => {
      if (petition.state === 'rejected') {
        petitionsRejected.push(petition);
      } else {
        petitionsAccepted.push(petition);
      }
    });
  }

  petitionsAccepted.sort((a, b) => b.signature_count - a.signature_count);
  petitionsRejected.sort((a, b) => b.signature_count - a.signature_count);

  fs.writeFileSync('petitionsAccepted.json', JSON.stringify(petitionsAccepted, null, 2))
  fs.writeFileSync('petitionsRejected.json', JSON.stringify(petitionsRejected, null, 2))
  return;
}

start().catch(error => console.log(error));
