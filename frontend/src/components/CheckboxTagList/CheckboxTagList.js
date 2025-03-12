import { Checkbox } from 'antd';
import React from 'react';

const CheckboxTagList = ({ tags, selectedTags, setSelectedTags }) => {
  const options = tags.map(tag => ({
    label: tag.name,
    value: tag._id,
  }));

  return (
    <Checkbox.Group 
      options={options} 
      value={selectedTags} 
      onChange={setSelectedTags} 
    />
  );
};

export default CheckboxTagList;
