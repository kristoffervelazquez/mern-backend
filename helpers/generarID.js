import { randomUUID } from 'crypto';

const generarID = () => {
    const id = randomUUID();
    return id;
}

export default generarID;