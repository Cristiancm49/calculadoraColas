import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';

import ResultItem from '../components/results/ResultItem';
import Button, { ButtonType } from '../components/buttons/Button';
import Input, { InputTypes } from '../components/inputs/Input';
import OptionInput, {
  OptionInputTypes,
} from '../components/inputs/OptionInput';
import { MM1Model } from '../library/queueing/formulas/MM1.model';
import { SystemOrQueuing, TypeCalculate } from '../library/queueing/Constants';

type MM1Values = {
  lambda: number;
  miu: number;
  n: number;
  calculate: TypeCalculate;
  system: SystemOrQueuing;
};

const LabelSystemOrQueuing: any = {
  system: 'el sistema',
  queuing: 'la cola',
};

const LabelTypeCalculate: any = {
  fixed: 'exactamente',
  max: 'máximo',
  least: 'al menos',
};

const MM1 = () => {
  const [showResult, setShowResult] = useState({ loading: false, show: false });
  const [result, setResult] = useState<MM1Model>();
  const [labelPn, setLabelPn] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<MM1Values>();

  const onSubmit: SubmitHandler<MM1Values> = async (data) => {
    // parse data for avoid problems
    let lambda = parseFloat(data.lambda.toString());
    let miu = parseFloat(data.miu.toString());
    let n = parseInt(data.n.toString());
    const model = new MM1Model(lambda, miu, n);

    if (model.isStatable()) {
      setShowResult({ loading: true, show: false });
      await model.calculateAll(data.system, data.calculate);
      setResult(model);
      setLabel(n, data.calculate, data.system);
      setShowResult({ loading: false, show: true });
    } else {
      alert('no cumple con la condición de estabilidad');
    }
  };

  useEffect(() => {
    setValue('calculate', TypeCalculate.Fixed);
    setValue('system', SystemOrQueuing.System);
  }, [setValue]);

  const setLabel = (n: number, calculate: string, operation: string) => {
    setLabelPn(`Probabilidad de hallar 
    ${LabelTypeCalculate[calculate] || 'exactamente'} 
    ${n} clientes en ${LabelSystemOrQueuing[operation] || 'el sistema'}`);
  };

  return (
    <div className="flex justify-center h-full lg:items-center">
      <div className="flex flex-col rounded-xl w-full shadow-md overflow-hidden sm:w-11/12 lg:flex-row lg:w-11/12">
        <div className="bg-white px-6 pt-4 border w-full">
          <div className="relative flex my-3 justify-center items-center">
            <Link
              to="/"
              className="absolute left-0 hover:bg-gray-200 rounded-full p-2"
              title="back"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"
                />
              </svg>
            </Link>
            <h2 className="font-bold text-xl">M/M/1</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              symbol="λ"
              label="tasa de llegada"
              name="lambda"
              placeholder="0"
              type={InputTypes.Number}
              register={register}
              error={errors.lambda}
              step='0.001'
              required={{ required: 'El campo es obligatorio' }}
            />
            <Input
              symbol="μ"
              label="tasa de servicio"
              name="miu"
              placeholder="0"
              type={InputTypes.Number}
              register={register}
              error={errors.miu}
              container="mt-2"
              step='0.001'
              required={{ required: 'El campo es obligatorio' }}
            />
            <div className="mt-2">
              <Input
                symbol="N"
                label="clientes"
                name="n"
                placeholder="0"
                type={InputTypes.Number}
                register={register}
                error={errors.n}
              />
            </div>
            <div className="ml-2 mt-2">
              <p>Opciones para calculo de Pn</p>
              <div className="flex mt-1">
                <div>
                  <OptionInput
                    label="Exactamente"
                    name="calculate"
                    option={TypeCalculate.Fixed}
                    register={register}
                    type={OptionInputTypes.Radio}
                  />
                  <OptionInput
                    label="Al menos"
                    name="calculate"
                    option={TypeCalculate.AtLeast}
                    register={register}
                    type={OptionInputTypes.Radio}
                  />
                  <OptionInput
                    label="Máximo"
                    name="calculate"
                    option={TypeCalculate.Max}
                    register={register}
                    type={OptionInputTypes.Radio}
                  />
                </div>
                <div className="ml-4">
                  <OptionInput
                    label="Sistema"
                    name="system"
                    option={SystemOrQueuing.System}
                    register={register}
                    type={OptionInputTypes.Radio}
                  />
                  <OptionInput
                    label="Cola"
                    name="system"
                    option={SystemOrQueuing.Queuing}
                    register={register}
                    type={OptionInputTypes.Radio}
                  />
                </div>
              </div>
            </div>
            <div className="my-8">
              <Button text="Calcular" type={ButtonType.Submit} />
            </div>
          </form>
        </div>
        <div
          className={`w-full lg:min-h-full flex justify-center border px-6 pt-4
          ${!showResult.show ? 'bg-green-200' : 'bg-white'}`}
        >
          {showResult.loading ? (
            <p className="self-center my-36">Calculando resultados...</p>
          ) : !showResult.show ? (
            <p className="self-center my-36">
              
            </p>
          ) : (
            <div>
              <div className="relative flex my-3 justify-center items-center">
                <h2 className="font-bold text-2xl">Resultados de datos ingresados</h2>
              </div>
              <div className="grid  sm:grid-cols-2 gap-8 ">
                <div>
                  <ResultItem
                    symbol="ρ"
                    label="Probabilidad de hallar el sistema ocupado"
                    value={result?.ro.toFixed(5)}
                  />
                  <ResultItem
                    symbol="P0"
                    label="Probabilidad de hallar el sistema vacío"
                    value={result?.p0.toFixed(5)}
                  />
                  <ResultItem
                    symbol="Pn"
                    label={labelPn}
                    value={result?.pn.toFixed(5)}
                  />
                  <ResultItem
                    symbol="Lq"
                    label="El número esperado de clientes en la cola"
                    value={result?.lq.toFixed(5)}
                  />
                  <ResultItem
                    symbol="L"
                    label="El número esperado de clientes en el sistema"
                    value={result?.l.toFixed(5)}
                  />
                </div>
                <div>
                  <ResultItem
                    symbol="Wq"
                    label="El tiempo esperado en la cola por los clientes"
                    value={result?.wq.toFixed(5)}
                  />
                  <ResultItem
                    symbol="W"
                    label="El tiempo promedio esperado en el sistema por los clientes"
                    value={result?.w.toFixed(5)}
                  />
                  <ResultItem
                    symbol="Ln"
                    label="El número esperado de clientes en la cola no vacía"
                    value={result?.ln.toFixed(5)}
                  />
                  <ResultItem
                    symbol="Wn"
                    label="El tiempo esperado en la cola para colas no vacías por los clientes"
                    value={result?.wn.toFixed(5)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MM1;
