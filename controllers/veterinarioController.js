import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarID from "../helpers/generarID.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

const registrar = async (req, res) => {
    const { email, nombre } = req.body;

    // Prevenir usuarios duplicados
    const existeUsuario = await Veterinario.findOne({ email });

    if (existeUsuario) {
        const error = new Error('Usuario ya registrado')
        console.log(error)
        return res.status(401).json({ msg: error.message });
    }

    try {
        // Guardar un Nuevo Veterinario
        const veterinario = new Veterinario(req.body)
        const veterinarioGuardado = await veterinario.save();

        // Enviar email de confirmación
        emailRegistro({email, nombre, token: veterinarioGuardado.token });

        res.json(veterinarioGuardado);

    } catch (error) {
        console.error(error.message);
    }
}

const perfil = (req, res) => {
    const { veterinario } = req;
    res.json(veterinario)
}

const confirmar = async (req, res) => {
    const { token } = req.params // desde la url es por req.params

    const usuarioConfirmar = await Veterinario.findOne({ token })

    if (!usuarioConfirmar) {
        const error = new Error('Token no valido')
        return res.status(401).json({ msg: error.message });
    }

    try {
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        await usuarioConfirmar.save();
        res.json({ msg: 'Usuario confirmado correctamente' })
    } catch (error) {
        console.log(error.message)
    }


}

const autenticar = async (req, res) => {
    const { email, password } = req.body
    // Comprobar si el usuario existe
    const usuario = await Veterinario.findOne({ email })

    if (!usuario) {
        const error = new Error('El usuario no existe')
        return res.status(403).json({ msg: error.message });
    }

    // Comprobar si el ususario está confirmado
    if (!usuario.confirmado) {
        const error = new Error('La cuenta no ha sido confirmada')
        return res.status(403).json({ msg: error.message });
    }

    // Revisar el password
    if (await usuario.comprobarPassword(password)) {
        // Autenticar
        res.json({ token: generarJWT(usuario.id) })
    } else {
        const error = new Error('El nombre de usuario y la contraseña no coinciden')
        return res.status(403).json({ msg: error.message });
    }

}

const olvidePassword = async (req, res) => {
    const { email } = req.body;
    const existeVeterinario = await Veterinario.findOne({ email });

    if (!existeVeterinario) {
        const error = new Error('El usuario no existe')
        return res.status(400).json({ msg: error.message });
    }

    try {
        existeVeterinario.token = generarID();
        await existeVeterinario.save();

        // Enviar email con instrucciones
        emailOlvidePassword({nombre: existeVeterinario.nombre, email, token: existeVeterinario.token});

        res.json({ msg: 'Hemos enviado un email con las instrucciones' })
    } catch (error) {
        console.error(error.message)
    }
}

const comprobarToken = async (req, res) => {
    const { token } = req.params;
    const tokenValido = await Veterinario.findOne({ token })

    if (!tokenValido) {
        const error = new Error('Token no valido')
        return res.status(400).json({ msg: error.message });
    }


    res.json({ msg: 'token valido y el usuario existe' });
}

const nuevoPassword = async (req, res) => {
    const { token } = req.params;
    console.log(token)
    const { password } = req.body;

    const veterinario = await Veterinario.findOne({ token });

    if (!veterinario) {
        const error = new Error('Hubo un error')
        return res.status(400).json({ msg: error.message });
    }

    try {
        veterinario.token = null
        veterinario.password = password
        await veterinario.save();
        res.json({msg: 'Password modificada con éxito'})
    } catch (error) {
        console.error(error.message)
    }

}
export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword
}