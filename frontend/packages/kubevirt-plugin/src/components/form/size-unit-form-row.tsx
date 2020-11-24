import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { FormSelect, FormSelectOption, Split, SplitItem } from '@patternfly/react-core';
import { ValidationObject } from '@console/shared';
import { prefixedID } from '../../utils';
import { getStringEnumValues } from '../../utils/types';
import { isValidationError } from '../../utils/validations/common';
import { FormRow } from './form-row';
import { Integer } from './integer/integer';
import { BinaryUnit, toIECUnit } from './size-unit-utils';

import './size-unit-form-row.scss';

type SizeUnitFormRowProps = {
  size: string;
  title?: string;
  unit: BinaryUnit;
  units?: BinaryUnit[];
  validation?: ValidationObject;
  id?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  onSizeChanged?: (size: string) => void;
  onUnitChanged?: (unit: BinaryUnit) => void;
};
export const SizeUnitFormRow: React.FC<SizeUnitFormRowProps> = ({
  title = null,
  size,
  unit,
  units,
  validation,
  id,
  isRequired,
  isDisabled,
  onSizeChanged = () => undefined,
  onUnitChanged = () => undefined,
}) => {
  const { t } = useTranslation();

  const titleText = title || t('kubevirt-plugin~Size');

  return (
    <FormRow
      key="size"
      title={titleText}
      fieldId={prefixedID(id, 'size')}
      isRequired={isRequired}
      validation={validation}
    >
      <Split>
        <SplitItem isFilled>
          <Integer
            isFullWidth
            isValid={!isValidationError(validation)}
            isDisabled={isDisabled}
            id={prefixedID(id, 'size')}
            value={size}
            isPositive
            onChange={React.useCallback((v) => onSizeChanged(v), [onSizeChanged])}
            aria-label={t('kubevirt-plugin~{{title}} size', { title: titleText })}
          />
        </SplitItem>
        <SplitItem>
          <FormSelect
            className="kubevirt-size-unit-form-row__unit"
            onChange={React.useCallback((u) => onUnitChanged(u as BinaryUnit), [onUnitChanged])}
            value={unit}
            id={prefixedID(id, 'unit')}
            isDisabled={isDisabled}
            aria-label={t('kubevirt-plugin~{{title}} unit', { title: titleText })}
          >
            {(units || getStringEnumValues<BinaryUnit>(BinaryUnit)).map((u) => (
              <FormSelectOption key={u} value={u} label={toIECUnit(u)} />
            ))}
          </FormSelect>
        </SplitItem>
      </Split>
    </FormRow>
  );
};
