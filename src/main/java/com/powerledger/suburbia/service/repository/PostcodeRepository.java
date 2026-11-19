package com.powerledger.suburbia.service.repository;

import com.powerledger.suburbia.models.Postcode;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface PostcodeRepository extends CrudRepository<Postcode, String> {

    List<Postcode> findByPostcodeBetween(String from, String to);

}
