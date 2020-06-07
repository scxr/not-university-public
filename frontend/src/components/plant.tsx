import React from 'react';

import { LocationData, Plant } from '@/types';

type PlantCardProps = {
  plant: Plant
  locationData: LocationData
};

const PlantCard: React.FunctionComponent<PlantCardProps> = ({ plant, locationData }) => {
  const suitableForLocation = (Number(locationData.rainfall) / 100) <= plant.max_precip.inches &&
                              (Number(locationData.rainfall) / 100) >= plant.min_precip.inches;

  return (
    <a
      href={ `https://www.burpee.com/search?q=${ plant.common_name.split(' ').join('+') }` }
      target='_blank' rel='noopener noreferrer'
    >
      <div className={ `rounded-md ${ suitableForLocation ? 'bg-white' : 'bg-red-300' } ${ suitableForLocation ? 'hover:bg-gray-300' : 'hover:bg-red-500' } p-3 my-3` }>
        <div className='flex flex-row items-center'>
          <img
            src={ plant.images.length > 0 ? plant.images[0].url : 'https://images.vexels.com/media/users/3/130737/isolated/preview/eda05fc56dfe940a821c06439bb7d49b-growing-plant-icon-by-vexels.png' }
            alt='Plant'
            className='rounded-full h-20 w-20'
          />
          <div className='ml-2'>
            <h1 className='text-2xl font-bold font-baron leading-none capitalize'>{ plant.common_name }</h1>
            <p className='leading-tight text-sm font-baron italic capitalize'>
              { plant.scientific_name } ({ plant.family })
            </p>
            {
              plant.min_precip.inches != null ? (
                <p className='text-sm font-bold leading-none'>
                  { plant.min_precip.inches }-{ plant.max_precip.inches } in. / year
                </p>
              ) : null
            }
          </div>
        </div>
      </div>
    </a>
  );
};

export default PlantCard;
