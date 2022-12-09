import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_EMAIL
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './PlaceForm.css';

const VerificationForm = () => {

  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [formState, inputHandler] = useForm(
    {
      website: {
        value: '',
        isValid: false
      },
      document: {
        value: null,
        isValid: false
      },
      officialEmail: {
        value: '',
        isValid: false
      },
      newsArticles: {
        value: [],
        isValid: false
      },
      googleTrendsProfile: {
        value: '',
        isValid: false
      },
      wikipediaLink: {
        value: '',
        isValid: false
      },
      instagramLink: {
        value: '',
        isValid: false
      }
    },
    false
  );

  const history = useHistory();

  const requestSubmitHandler = async event => {
    event.preventDefault();


    try {
      const formData = new FormData();
      formData.append('website', formState.inputs.website.value);
      formData.append('document', formState.inputs.document.value);
      formData.append('officialEmail', formState.inputs.officialEmail.value);
      formData.append('newsArticles', formState.inputs.newsArticles.value);
      formData.append('googleTrendsProfile', formState.inputs.googleTrendsProfile.value);
      formData.append('wikipediaLink', formState.inputs.wikipediaLink.value);
      formData.append('officialEmail', formState.inputs.instagramLink.value);
      await sendRequest('http://localhost:5000/api/users/saveVerificationDetails/'+auth.userId, 'POST', formData, {
        Authorization: 'Bearer ' + auth.token
      });
      history.push('/');
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <form className="place-form" onSubmit={requestSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        
        <Input
          id="website"
          element="input"
          type="text"
          label="Link to personal/business website"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid website."
          onInput={inputHandler}
        />
        <ImageUpload
          id="document"
          onInput={inputHandler}
          errorText="Please provide an image of your ID card"
        />
        <Input
          id="officialEmail"
          element="textarea"
          label="Official email address"
          validators={[VALIDATOR_EMAIL()]}
          errorText="Please enter a valid email"
          onInput={inputHandler}
        />
        <Input
          id="newsArticles"
          element="input"
          type="text"
          label="Link to one of your news articles"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid article."
          onInput={inputHandler}
        />
        <Input
          id="googleTrendsProfile"
          element="input"
          type="text"
          label="Link to your Google Trends Profile"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid profile"
          onInput={inputHandler}
        />
        <Input
          id="wikipediaLink"
          element="input"
          type="text"
          label="Link to your Wikipedia page"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid page"
          onInput={inputHandler}
        />
        <Input
          id="instagramLink"
          element="input"
          type="text"
          label="Link to your Instagram Profile"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid profile"
          onInput={inputHandler}
        />
        
        <Button type="submit" disabled={!formState.isValid}>
          Submit Verification Request
        </Button>
      </form>
    </React.Fragment>
  );
};

export default VerificationForm;
