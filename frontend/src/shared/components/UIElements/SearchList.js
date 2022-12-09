import React from 'react';
import SearchCard from './SearchCard';

function SearchList({ filteredPersons }) {
  const filtered = filteredPersons.map(person =>  <SearchCard key={person.id} person={person} />); 
  return (
    <div>
      {filtered}
    </div>
  );
}

export default SearchList;