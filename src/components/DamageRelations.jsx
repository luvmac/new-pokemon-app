import React, { useEffect, useState } from 'react'
import Type from './Type'

const DamageRelations = ({damages}) => {

  const [damagePokemonForm, setDamagePokemonForm] = useState();
  
  
  useEffect(() => {
    const arrayDamage = damages.map((damage) => 
      separateObjectBetweenToAndFrom(damage))
      console.log('첫번째 부분 arrayDamage', arrayDamage)
    
    if(arrayDamage.length === 2) {
      // 합치는 부분
      const obj = joinDamageRelations(arrayDamage);
      setDamagePokemonForm(reduceDuplicateValues(postDamageValue(obj.from)));
              
    } else {
      
      setDamagePokemonForm(postDamageValue(arrayDamage[0].from));
    }
    
  }, [damages]) 

  const joinDamageRelations = (props) => {
    return {
      to: joinObjects(props,'to'),
      from :joinObjects(props, 'from')
    }
  }

  const reduceDuplicateValues = (props) => {

    const duplicateValues = { 

      double_damage: '4x',
      half_damage: '1/4x',
      no_damage: '0x'

    }
    return Object.entries(props)
      .reduce((acc, [keyName, value]) => {
        const key = keyName;
        //console.log(acc, [keyName, value])

        const verifiedValue = filtefForUniqueValues(
          
            value,
            duplicateValues[key]

        )
          return (acc = { [keyName]: verifiedValue, ...acc });
      }, {})
  }

  const filtefForUniqueValues = (valueForFiltering, damagevalue) => {
    
   // console.log(valueForFiltering, damagevalue);

    return valueForFiltering.reduce((acc, currentValue) => {

      const { url, name } = currentValue;
      
      //console.log(' url 과 name : ', url, name );

      const filterACC = acc.filter((a) => a.name !== name);

      return filterACC.length === acc.length 
      ? (acc = [currentValue, ...acc])
      : (acc = [{damageValue: damagevalue, name, url }, ...filterACC])


    }, [])

  }

  const joinObjects = (props, string)  => {

    const key = string;
    //const to = props[0];
    
    const firstArrayValue = props[0][key];
    const secondArrayValue = props[1][key];

    //데미지를 받는것만 데이터 정리하기 주는 것(to)까지하면 너무 많아서?
   const result = Object.entries(secondArrayValue)
    .reduce((acc, [keyName, value]) => {
      
      const result = firstArrayValue[keyName].concat(value);
      
      return (acc = { [keyName]: result, ...acc})

    }, {})
     
    return result;
  }

  const postDamageValue = (props) => {
      const result =  Object.entries(props)
      .reduce((acc, [keyName, value]) => {
        
        const key = keyName

        const valuesOfKeyName = {
          double_damage: '2x',
          half_damage:  '1/2x',
          no_damage: '0x'
        };

        //console.log(acc =  {keyName, value])
        return (acc = {
            [keyName]: value.map(i => ({
            damagevalue: valuesOfKeyName[key],
            ...i
          })),
          ...acc
       })
      }, {})  
      return result;
      
  }

  const separateObjectBetweenToAndFrom = (damage) => {
    const from = filterDamageRelations('_from', damage);
    const to = filterDamageRelations('_to', damage);
    return { from, to }
  }

  const filterDamageRelations = (valueFilter, damage) => {
   const result =  Object.entries(damage)
    .filter(([keyName, valueName]) => {
      // console.log('keyname',keyName)
      // console.log('valueName',valueName)
      return keyName.includes(valueFilter);

    })
    .reduce((acc, [keyName, value]) => {
      const keyWithValueFilterRemove = keyName.replace(valueFilter,'');
      //console.log((acc, [keyWithValueFilterRemove, value]))
      return (acc = { [keyWithValueFilterRemove]: value, ...acc })

    }, {})

    return result;

  }
  

  return (

    <div className='flex gap-2 flex-col'>
      {damagePokemonForm ? (
          <>
            {Object.entries(damagePokemonForm)
              .map(([keyName, value]) => {
                const key = keyName;
                const valuesOfKeyName = {
                  double_damage: 'Weak',
                  half_damage: 'Resistant',
                  no_damage: 'Immune'
                }

                 return  (
                  <div key={key}>
                      <h3 className='capitalize font-medium text-sm md:text-base text-slate-500 text-center'>
                        {valuesOfKeyName[key]}
                      </h3>
                      <div className='flex flex-wrap gap-1 justify-center'>
                        { value.length > 0 ? (
                            value.map(({ name, url, damageValue }) => { 
                              return ( 
                                <Type 
                                    type={name}
                                    key={url}
                                    damageValue={damageValue}
                                />
                              )
                            })
                        ):(
                            <Type 
                              type={'none'}
                              key={'none'}
                              /> 
                        )}
                      </div>
                  </div>
                 )

              })
            }
          </>
        ): <div></div>
      }
    </div>
  )
}

export default DamageRelations