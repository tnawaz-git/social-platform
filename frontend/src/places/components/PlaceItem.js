import React, { useState, useContext } from 'react';

import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import Map from '../../shared/components/UIElements/Map';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import './PlaceItem.css';

const PlaceItem = props => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const [showMap, setShowMap] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showShareDirectModal, setShowShareDirectModal] = useState(false);
  // const [showConfirmModal, setShowLikeModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  // const [showConfirmModal, setShowBookmarkModal] = useState(false);

  // const openMapHandler = () => setShowMap(true);

  const closeMapHandler = () => setShowMap(false);

  const showShareHandler = () => {
    setShowShareModal(true);
  };

  const showShareDirectHandler = () => {
    setShowShareDirectModal(true);
  };

  const showCommentHandler = () => {
    setShowCommentModal(true);
  };
 
  const showDeleteWarningHandler = () => {
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  };

  const cancelShareHandler = () => {
    setShowShareModal(false);
  };

  const cancelShareDirectHandler = () => {
    setShowShareDirectModal(false);
  };

  const cancelCommentHandler = () => {
    setShowCommentModal(false);
  };

  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try {
      await sendRequest(
        `http://localhost:5000/api/places/${props.id}`,
        'DELETE',
        null,
        {
          Authorization: 'Bearer ' + auth.token
        }
      );
      props.onDelete(props.id);
    } catch (err) {}
  };

  const confirmShareHandler = async () => {
    setShowShareModal(false);
    try {
      await sendRequest(
        `http://localhost:5000/api/places/share/${props.id}/${auth.userId}`,
        'POST',
        null,
        {
          Authorization: 'Bearer ' + auth.token
        }
      );
    } catch (err) {}
  };

  const confirmShareDirectHandler = async () => {
    setShowShareDirectModal(false);
    // try {
    //   await sendRequest(
    //     `http://localhost:5000/api/places/${props.id}`,
    //     'DELETE',
    //     null,
    //     {
    //       Authorization: 'Bearer ' + auth.token
    //     }
    //   );
    //   props.onDelete(props.id);
    // } catch (err) {}
  };

  const confirmCommentHandler = async () => {
    setShowCommentModal(false);
    try {
      await sendRequest(
        `http://localhost:5000/api/places/comment/${props.id}/${auth.userId}`,
        'POST',
        null,
        {
          Authorization: 'Bearer ' + auth.token
        }
      );
    } catch (err) {}
  };

  const likePost = async () => {
    try {
      await sendRequest(
        `http://localhost:5000/api/places/like/${props.id}/${auth.userId}`,
        'POST',
        null,
        {
          Authorization: 'Bearer ' + auth.token
        }
      );
    } catch (err) {}
  };

  const bookmarkPost = async () => {
    try {
      await sendRequest(
        `http://localhost:5000/api/users/bookmark/${props.id}/${auth.userId}`,
        'POST',
        null,
        {
          Authorization: 'Bearer ' + auth.token
        }
      );
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showMap}
        onCancel={closeMapHandler}
        //header={props.address}
        contentClass="place-item__modal-content"
        footerClass="place-item__modal-actions"
        footer={<Button onClick={closeMapHandler}>CLOSE</Button>}
      >
        <div className="map-container">
          <Map center={props.coordinates} zoom={16} />
        </div>
      </Modal>
      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        footerClass="place-item__modal-actions"
        footer={
          <React.Fragment>
            <Button inverse onClick={cancelDeleteHandler}>
              Cancel
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              Confirm
            </Button>
          </React.Fragment>
        }
      >
        <p>
          Do you want to proceed and delete this post? Please note that it
          can't be undone thereafter.
        </p>
      </Modal>

      <Modal
        show={showShareModal}
        onCancel={cancelShareHandler}
        header="Share?"
        footerClass="place-item__modal-actions"
        footer={
          <React.Fragment>
            <Button inverse onClick={cancelShareHandler}>
              Cancel
            </Button>
            <Button danger onClick={confirmShareHandler}>
              Confirm
            </Button>
          </React.Fragment>
        }
      >
        <p>
          Do you want to share this post on your newsfeed?
        </p>
      </Modal>

      <Modal
        show={showShareDirectModal}
        onCancel={cancelShareDirectHandler}
        header="Share Direct?"
        footerClass="place-item__modal-actions"
        footer={
          <React.Fragment>
            <Button inverse onClick={cancelShareDirectHandler}>
              Cancel
            </Button>
            <Button danger onClick={confirmShareDirectHandler}>
              Confirm
            </Button>
          </React.Fragment>
        }
      >
        <p>
          Do you want to share this post via message?
        </p>
      </Modal>

      <Modal
        show={showCommentModal}
        onCancel={cancelCommentHandler}
        header="Share?"
        footerClass="place-item__modal-actions"
        footer={
          <React.Fragment>
            <Button inverse onClick={cancelCommentHandler}>
              Cancel
            </Button>
            <Button danger onClick={confirmCommentHandler}>
              Confirm
            </Button>
          </React.Fragment>
        }
      >
        <p>
          Do you want to comment on this post?
        </p>
      </Modal>



      <li className="place-item">
        <Card className="place-item__content">
          {isLoading && <LoadingSpinner asOverlay />}
          <div className="place-item__image">
            <img
              src={`http://localhost:5000/${props.image}`}
              alt={props.title}
            />
          </div>
          <div className="place-item__info">
            <h2>{props.title}</h2>
            //<h3>{props.address}</h3>
            <p>{props.description}</p>
            <h5>Likes:</h5>
            <ul>
            {props.likes?.map(like => (
              <li key={like}>{like[0]}</li>
            ))}
          </ul>
            <h5>Comments:</h5>
            <ul>
            {props.comments?.map(comment => (
              <li key={comment}>{comment[2]} -  {comment[3]} - {comment[0]} </li>
            ))}
          </ul>
            
          </div>
          <div className="place-item__actions">
            <Button inverse onClick={showShareHandler}>
              Share via News Feed
            </Button>            

            <Button inverse onClick={showShareDirectHandler}>
              Share via Direct Message
            </Button>
            
            <Button inverse onClick={likePost}>Like</Button>

            <Button inverse onClick={showCommentHandler}>
              Comment
            </Button>

            <Button inverse onClick={bookmarkPost}>Bookmark</Button>
            <br></br>
            {auth.userId === props.creatorId && (
              <Button to={`/places/${props.id}/${auth.userId}`}>Edit</Button>
            )}

            {auth.userId === props.creatorId && (
              <Button danger onClick={showDeleteWarningHandler}>
                Delete
              </Button>
            )}
          </div>
        </Card>
      </li>
    </React.Fragment>
  );
};

export default PlaceItem;
