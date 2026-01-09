package com.example.fuzzymachineefficiency.mapper;

import com.example.fuzzymachineefficiency.dto.MachineDto;
import com.example.fuzzymachineefficiency.entity.Machine;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MachineMapper {

    Machine dtoToEntity(MachineDto dto);

    MachineDto entityToDto(Machine machine);

    @Mapping(target = "id", ignore = true)
    void updateMachineFromDto(MachineDto dto, @MappingTarget Machine entity);
}
