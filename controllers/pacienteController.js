import Paciente from "../models/Paciente.js";
import mongoose from "mongoose";

const agregarPaciente = async (req, res) => {
    // const {nombre, propietario, telefono, email, fecha, sintomas} = req.body;

    const paciente = new Paciente(req.body);
    // Paciente en su tabla veterianario = al veterinario logeado en sesion
    paciente.veterinario = req.veterinario._id;

    try {
        const pacienteAgregado = await paciente.save();
        res.json(pacienteAgregado)

    } catch (err) {
        console.error(err.message);
        const error = new Error('Hubo un error al guardar el paciente')
        return res.status(400).json({ msg: error.message });

    }


}

const obtenerPacientes = async (req, res) => {
    const pacientes = await Paciente.find()
        .where('veterinario').equals(req.veterinario._id)
    res.json(pacientes)
}

const obtenerPaciente = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('Id no válido');
        return res.status(403).json({ msg: error.message });
    }
    const paciente = await Paciente.findById(id)

    if (!paciente) {
        return res.status(404).json({ msg: 'Paciente no encontrado' })
    }

    if (paciente.veterinario._id.toString() !== req.veterinario._id.toString()) {
        return res.json({ msg: 'Acción no válida' })
    }

    res.json(paciente)

}

const actualizarPaciente = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('Id no válido');
        return res.status(403).json({ msg: error.message });
    }
    const paciente = await Paciente.findById(id);

    if (!paciente) {
        return res.status(404).json({ msg: 'Paciente no encontrado' })
    }

    if (paciente.veterinario._id.toString() !== req.veterinario._id.toString()) {
        return res.json({ msg: 'Acción no válida' })
    }


    // Actualizar paciente
    paciente.nombre = req.body.nombre || paciente.nombre;
    paciente.propietario = req.body.propietario || paciente.propietario;
    paciente.fecha = req.body.fecha || paciente.fecha;
    paciente.email = req.body.email || paciente.email;
    paciente.telefono = req.body.telefono || paciente.telefono;
    paciente.sintomas = req.body.sintomas || paciente.sintomas;

    try {
        const pacienteActualizado = await paciente.save();
        res.json(pacienteActualizado)
    } catch (error) {
        console.error(error.message)
    }


}

const eliminarPaciente = async (req, res) => {
    const { id } = req.params;


    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('Id no válido');
        return res.status(403).json({ msg: error.message });
    }

    const paciente = await Paciente.findById(id);

    if (!paciente) {
        return res.status(404).json({ msg: 'Paciente no encontrado' })
    }

    if (paciente.veterinario._id.toString() !== req.veterinario._id.toString()) {
        return res.json({ msg: 'Acción no válida' })
    }

    try {
        await paciente.deleteOne();
        res.json({ msg: 'Paciente eliminado' })
    } catch (error) {
        console.error(error.message)
    }

}




export {
    agregarPaciente,
    obtenerPacientes,
    obtenerPaciente,
    actualizarPaciente,
    eliminarPaciente
}