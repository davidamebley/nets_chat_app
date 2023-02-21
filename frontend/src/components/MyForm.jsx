import axios from 'axios';

const handleSubmit = (event) => {
  event.preventDefault();

  const textInput = event.target.textInput.value;

  axios.post('/api/textinput', { textInput })
    .then((response) => {
      console.log('Text input sent successfully');
    })
    .catch((error) => {
      console.error('Error sending text input:', error);
    });
};

const MyForm = () => {
  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="textInput">Enter some text:</label>
      <input type="text" name="textInput" id="textInput" />
      <button type="submit">Submit</button>
    </form>
  )
}

export default MyForm