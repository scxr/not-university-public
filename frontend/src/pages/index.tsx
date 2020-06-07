import React, {useState} from 'react';

import Head from 'next/head';
import PlantCard from '@/components/plant';

import { LocationData, Plant } from '@/types';
import { NextPageContext } from 'next';

import request from 'request-promise';

type HomeProps = {
  city: string;
  country_code: string;
  country_name: string;
  ip: string;
  latitude: number;
  longitude: number;
  metro_code: string;
  region_code: string;
  region_name: string;
  time_zone: string;
  zip_code: string;
};

const Home: React.FunctionComponent<HomeProps> = ({ city, region_code, longitude, latitude }) => {
  const prod = process.env.NODE_ENV === 'production';
  const apiUrl = prod ? 'https://not-university-hackathon-site.herokuapp.com' : 'http://0.0.0.0:8080';

  const [locationData, setLocationData] = useState({} as LocationData);
  const [nonUS, setNonUS] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [suggestedPlants, setSuggestedPlants] = React.useState([]);
  const [plants, setPlants] = React.useState([]);
  const fetchingTimeout = React.useRef(null);
  React.useEffect(() => {
    if (search == '') return;
    if (fetchingTimeout.current != null) {
      clearTimeout(fetchingTimeout.current);
      fetchingTimeout.current = null;
    }
    fetchingTimeout.current = setTimeout(() => {
      console.log('fetching...');
      fetch(apiUrl + '/plants?search=' + search)
        .then(res => res.json())
        .then(text => setPlants(JSON.parse(text)));
      fetchingTimeout.current = null;
    }, 100);
  }, [search]);
  React.useEffect(() => {
    fetch(apiUrl + '/weather/' + city)
      .then(res => res.json())
      .then(text => {
        const data = JSON.parse(text)[0];
        if (typeof data == 'undefined') {
          setNonUS(true);
          fetch(apiUrl + '/plants?search=')
            .then(res => res.json())
            .then(text => setSuggestedPlants(JSON.parse(text)));
        } else {
          setLocationData(data);
          fetch(apiUrl + '/plants/' + data.rainfall / 100)
            .then(res => res.json())
            .then(text => setSuggestedPlants(JSON.parse(text)));
        }
      });
  }, []);

  const results = search.trim().length > 0 ? plants : suggestedPlants;

  return (
    <div className='flex flex-col items-center bg-green-200 min-h-screen'>
      <Head>
        <title>Green Space</title>
      </Head>
      <div className='flex flex-col justify-center rounded-lg bg-green-500 p-5 w-5/6 mt-10'>
        <h1 className='font-natural text-green-100 text-center text-6xl'>
          Green Space
        </h1>
      </div>
      <div className='flex flex-col md:flex-row justify-around w-full'>
        <div className='w-11/12 md:w-1/2 ml-4 mr-8 mt-5'>
          <h2 className='text-2xl bg-green-100 font-bold text-center border-t-2 border-b-2 border-green-700 p-2'>
            Your Local Climate
          </h2>
          <div className='rounded-md bg-white font-default font-bold p-3 mt-5'>
            <p className='font-bold text-sm'>
              Location
              <a href='#' className='ml-1'>
                <span className='font-bold text-blue-500 hover:text-blue-600'>Not Correct?</span>
              </a>
            </p>
            <h3 className='text-2xl leading-none'>
              { locationData.city || String(city) }, { locationData.state || String(region_code) }
            </h3>
            <iframe
              scrolling='no'
              src={ `https://maps.google.com/maps?q=${locationData.latitude || latitude},${locationData.longitude || longitude}&z=10&output=embed` }
              className='mt-2'
            />
            {
              !nonUS ? (
                <>
                  <p className='font-bold text-sm mt-2'>
                    Nearest Weather Station
                  </p>
                  <p className='flex flex-row items-start'>
                    <h3 className='text-2xl font-baron leading-none'>
                      { locationData.station }
                    </h3>
                    <span className='text-xs font-baron leading-none ml-1'>
                ({ locationData.name })
              </span>
                  </p>
                  <p className='font-bold text-sm mt-2'>
                    Annual Rainfall
                  </p>
                  <p className='flex flex-row items-start'>
                    <h3 className='text-3xl font-baron leading-none'>
                      { (Number(locationData.rainfall) / 100).toFixed(1) }
                    </h3>
                    <span className='text-sm leading-none ml-1'>
                in.
              </span>
                  </p>
                </>
              ) : <h3 className='text-xl text-red-600 leading-none mt-5'>
                This service is not available outside of the U.S.
              </h3>
            }
          </div>
        </div>
        <div className='w-11/12 md:w-1/2 ml-4 mr-8 mt-5'>
          <h2 className='text-2xl bg-green-100 font-bold text-center border-t-2 border-b-2 border-green-700 p-2 mb-5'>
            Plants
          </h2>
          <input
            value={ search } placeholder='Search...'
            onChange={ e => setSearch(e.target.value) } className='w-full rounded-md p-3'
          />
          {
            results.map((plant, idx) => (
              <PlantCard key={ idx } plant={ plant as Plant } locationData={ locationData as LocationData }/>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Home;

export async function getServerSideProps(context: NextPageContext) {
  const data = await request({
    uri: 'http://api.ipstack.com/' + context.req.headers['x-forwarded-for'] + '?access_key=redacted&output=json&legacy=1',
    json: true
  });

  return {
    props: data
  };
}
