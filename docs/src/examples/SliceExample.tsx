import { useRef, memo } from 'react';
import { fieldwise } from 'fieldwise';
import { Input } from './components/Input';

const { useForm, useSlice } = fieldwise({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
}).hooks();

function NameFields() {
  const { fields, i } = useSlice(['firstName', 'lastName']);
  const rendersRef = useRef(0);
  rendersRef.current++;

  return (
    <div className="slice-section">
      <h4>Name Fields (Renders: {rendersRef.current})</h4>
      <div className="form-group">
        <label>First Name</label>
        <Input {...i('firstName')} placeholder="First name" />
      </div>
      <div className="form-group">
        <label>Last Name</label>
        <Input {...i('lastName')} placeholder="Last name" />
      </div>
      <div className="field-values">
        <small>
          First: {fields.firstName.value || '(empty)'}, Last:{' '}
          {fields.lastName.value || '(empty)'}
        </small>
      </div>
    </div>
  );
}

function ContactFields() {
  const { fields, i } = useSlice(['email', 'phone']);
  const rendersRef = useRef(0);
  rendersRef.current++;

  return (
    <div className="slice-section">
      <h4>Contact Fields (Renders: {rendersRef.current})</h4>
      <div className="form-group">
        <label>Email</label>
        <Input {...i('email')} placeholder="Email" />
      </div>
      <div className="form-group">
        <label>Phone</label>
        <Input {...i('phone')} placeholder="Phone" />
      </div>
      <div className="field-values">
        <small>
          Email: {fields.email.value || '(empty)'}, Phone:{' '}
          {fields.phone.value || '(empty)'}
        </small>
      </div>
    </div>
  );
}

const MemoizedNameFields = memo(NameFields);
const MemoizedContactFields = memo(ContactFields);

export default function SliceExample() {
  const { emit } = useForm();

  return (
    <div className="example">
      <div className="info-box">
        <p>
          <strong>Try it:</strong> Type in the name fields - notice only the
          name section re-renders. Type in contact fields - only the contact
          section re-renders.
        </p>
      </div>

      <MemoizedNameFields />
      <MemoizedContactFields />

      <button onClick={() => emit('reset')}>Reset Form</button>
    </div>
  );
}
